import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { User } from 'src/entities/user.entity';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Notification, User]),
  ],
  providers: [NotificationResolver, NotificationService, GqlAuthGuard],
})
export class NotificationModule {}
