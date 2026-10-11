import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { ConfigModule } from '@nestjs/config';



@Module({
   imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global:true,
    }),
    ConfigModule,
    MailModule
  ],
  providers: [AuthService,AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
