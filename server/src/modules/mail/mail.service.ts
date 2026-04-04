import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { LessThan, Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MailService {
  private transporter: any;
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendMail(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete({
      id: user.id,
      resetPasswordExpires: LessThan(new Date()),
    });

    const token = crypto.randomBytes(16).toString('hex');
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const newToken = this.userRepository.create({
      resetPasswordToken: token,
      resetPasswordExpires: new Date(Date.now() + 3600000),
    });
    
    try {
      await this.userRepository.save(newToken);
    } catch (error) {
      throw new InternalServerErrorException('Error saving reset token');
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset',
        text: `Click this link to reset your password: ${resetLink}`,
      });
      return 'Reset link sent';
    } catch (error) {
      throw new InternalServerErrorException('Error sending email');
    }
  }
}