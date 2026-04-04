import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';


@Module({
   imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global:true,
    }),
    ConfigModule,
    UserModule,
    MailModule
  ],
  providers: [AuthService],
  controllers: [AuthResolver]
})
export class AuthModule {}
