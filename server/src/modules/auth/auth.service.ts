import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { MoreThan, Repository } from 'typeorm';
import { RegisterDto } from 'src/dto/register.dto';
import { LoginDto } from 'src/dto/login.dto';
import { MailService } from '../mail/mail.service';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private configService: ConfigService,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    async register(registerDto: RegisterDto): Promise<string> {
        const { fullName, email, password } = registerDto;

        const existingEmail = await this.userRepository.findOne({ where: { email } });

        if (existingEmail) {
            throw new ConflictException('This email is already registered!');
        }

        const existingUsername = await this.userRepository.findOne({ where: { fullName } });

        if (existingUsername) {
            throw new ConflictException('Please try another username!');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = this.userRepository.create({
            fullName,
            email,
            password: hashedPassword,
        });

        try {
            await this.userRepository.save(newUser);
            return 'User created successfully!';
        } catch (error) {
            throw new InternalServerErrorException('Could not create user');
        }
    }

    async login(
        loginDto: LoginDto,
        res: Response
    ): Promise<{ access_token: string }> {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException("User doesn't exist");
        }

        const match = await bcrypt.compare(loginDto.password, user.password);

        if (!match) {
            throw new UnauthorizedException('Wrong password combination');
        }

        const { access_token } = await this.generateAccessToken({
            id: user.id,
            fullName: user.fullName,
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

        res.status(200).json({ access_token });
        return { access_token }
    }

    private async generateAccessToken(
        payload: {
            id: string,
            fullName: string
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
    ): Promise<string> {
        return await this.mailService.sendMail(email);
    }

    async resetPassword(
        token: string,
        newPassword: string,
        confirmPassword: string,
    ): Promise<{ message: string }> {
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
        refreshToken: string
    ): Promise<{ access_token: string }> {
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
        });

        return { access_token };
    }

    async logout(res: Response): Promise<void> {
        res.clearCookie('refresh_token');
    }
}
