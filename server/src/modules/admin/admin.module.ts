import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/entities/book.entity';
import { BookTransfer } from 'src/entities/book-transfer.entity';
import { Delivery } from 'src/entities/delivery.entity';
import { DeliveryTracking } from 'src/entities/delivery-tracking.entity';
import { Notification } from 'src/entities/notification.entity';
import { Dispute } from 'src/entities/dispute.entity';
import { Rental } from 'src/entities/rental.entity';
import { Store } from 'src/entities/store.entity';
import { User } from 'src/entities/user.entity';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      User,
      Book,
      Store,
      BookTransfer,
      Dispute,
      Rental,
      Delivery,
      DeliveryTracking,
      Notification,
    ]),
  ],
  providers: [AdminResolver, AdminService, GqlAuthGuard],
})
export class AdminModule {}
