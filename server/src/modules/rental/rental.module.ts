import { Module } from '@nestjs/common';
import { RentalService } from './rental.service';
import { RentalResolver } from './rental.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rental } from 'src/entities/rental.entity';
import { Book } from 'src/entities/book.entity';
import { Store } from 'src/entities/store.entity';
import { Delivery } from 'src/entities/delivery.entity';
import { Notification } from 'src/entities/notification.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GqlAuthGuard } from '../guard/jwt.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Rental, Book, Store, Delivery, Notification]),
  ],
  providers: [RentalResolver, RentalService, GqlAuthGuard],
})
export class RentalModule {}
