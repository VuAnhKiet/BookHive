import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { MoreThan, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { AuthResponse } from 'src/modules/auth/model/auth.model';
import { RegisterInput } from 'src/modules/auth/input/register.input';
import { LoginInput } from 'src/modules/auth/input/login.input';
import { ResetPasswordInput } from 'src/modules/auth/input/reset-password.input';
import { UserRole } from 'src/common/enum/user/user-role.enum';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private configService: ConfigService,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    async register(createUserInput: RegisterInput): Promise<AuthResponse> {
        const { fullName, email, password, confirmPassword } = createUserInput;

        if (password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        if (await this.findByEmail(email)) {
            throw new ConflictException('This email is already registered!');
        }

        const existingUsername = await this.userRepository.findOneBy({ fullName });
        if (existingUsername) {
            throw new ConflictException('Please try another username!');
        }

        const user = this.userRepository.create({
            fullName,
            email,
            password: await bcrypt.hash(password, 12),
            role: UserRole.USER,
        });

        await this.userRepository.save(user);
        return { message: 'User registered successfully.' };
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({ email });
    }

    async login(
        loginInput: LoginInput,
        res: Response
    ): Promise<AuthResponse> {
        const user = await this.userRepository.findOne({
            where: { email: loginInput.email },
        });

        if (!user) {
            throw new UnauthorizedException("User doesn't exist");
        }

        const match = await bcrypt.compare(loginInput.password, user.password);

        if (!match) {
            throw new UnauthorizedException('Wrong password combination');
        }

        const { access_token } = await this.generateAccessToken({
            id: user.id,
            fullName: user.fullName,
            role: user.role
        });

        const { refresh_token } = await this.generateRefreshToken({
            id: user.id,
            fullName: user.fullName,
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            accessToken: access_token,
            Role: user.role,
            message: 'Login successful.',
        };
    }

    private async generateAccessToken(
        payload: {
            id: string,
            fullName: string,
            role: string
        }
    ): Promise<{ access_token: string }> {
        const access_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
        });

        if (!access_token) {
            throw new BadRequestException('Failed to verify token');
        }

        return { access_token };
    }

    private async generateRefreshToken(
        payload: { id: string, fullName: string }
    ): Promise<{ refresh_token: string }> {
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION')
        });

        if (!refresh_token) {
            throw new BadRequestException('Failed to verify token');
        }

        return { refresh_token };
    }

    async sendMail(
        email: string
    ): Promise<AuthResponse> {
        const message = await this.mailService.sendMail(email);
        return { message };
    }

    async resetPassword(
        resetPasswordInput: ResetPasswordInput
    ): Promise<AuthResponse> {
        const { token, newPassword, confirmPassword } = resetPasswordInput;

        if (newPassword !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        if (newPassword.length < 8) {
            throw new BadRequestException(
                'Password must be at least 8 characters long',
            );
        }

        const user = await this.userRepository.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: MoreThan(new Date()),
            },
        });

        if (!user) {
            throw new BadRequestException('Reset link is invalid or expired');
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword) {
            throw new BadRequestException(
                'New password must be different from the old password',
            );
        }

        user.password = await bcrypt.hash(newPassword, 12);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.userRepository.save(user);

        return { message: 'Password reset successfully. Please log in again.' };
    }

    async refreshAccessToken(
        refreshToken: string | undefined
    ): Promise<AuthResponse> {
        if (!refreshToken) {
            throw new UnauthorizedException('Missing refresh token');
        }

        let payload: any;

        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.userRepository.findOne({
            where: { id: payload.id },
        });

        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        const { access_token } = await this.generateAccessToken({
            id: user.id,
            fullName: user.fullName,
            role: user.role
        });

        return {
            accessToken: access_token,
            Role: user.role,
            message: 'Access token refreshed successfully.',
        };
    }

    async logout(res: Response): Promise<AuthResponse> {
        res.clearCookie('refresh_token');
        return { message: 'Logged out successfully.' };
    }
}
