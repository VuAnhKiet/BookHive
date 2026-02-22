import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([User]),
    ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
