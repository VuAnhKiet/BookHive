import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from 'src/entities/delivery.entity';
import { DeliveryRelay } from 'src/entities/delivery-relay.entity';
import { DeliveryRoute } from 'src/entities/delivery-route.entity';
import { DeliveryTracking } from 'src/entities/delivery-tracking.entity';
import { DeliveryLeg } from 'src/entities/delivery-leg.entity';
import { Book } from 'src/entities/book.entity';
import { Notification } from 'src/entities/notification.entity';
import { Rental } from 'src/entities/rental.entity';
import { Store } from 'src/entities/store.entity';
import { DeliveryResolver } from './delivery.resolver';
import { DeliveryService } from './delivery.service';
import { GqlAuthGuard } from '../guard/jwt.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Delivery,
      DeliveryRoute,
      DeliveryRelay,
      DeliveryTracking,
      DeliveryLeg,
      Rental,
      Store,
      Book,
      Notification,
    ]),
  ],
  providers: [DeliveryResolver, DeliveryService, GqlAuthGuard],
})
export class DeliveryModule {}
