import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';
import { Rental } from 'src/entities/rental.entity';
import { User } from 'src/entities/user.entity';
import { Notification } from 'src/entities/notification.entity';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { PaymentMomoController } from './payment-momo.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Payment, Rental, User, Notification]),
  ],
  controllers: [PaymentMomoController],
  providers: [PaymentResolver, PaymentService, GqlAuthGuard],
})
export class PaymentModule {}
