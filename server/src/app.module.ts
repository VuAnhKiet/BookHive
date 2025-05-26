import { Module } from '@nestjs/common';
import { dataSourceOptions } from './config/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomGraphQLModule } from './config/graphql.module';
import { BookModule } from './modules/book/book.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RentalModule } from './modules/rental/rental.module';
import { ReviewModule } from './modules/review/review.module';
import { StoreModule } from './modules/store/store.module';
import { UserModule } from './modules/user/user.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    CustomGraphQLModule,
    BookModule,
    NotificationModule,
    PaymentModule,
    RentalModule,
    ReviewModule,
    StoreModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
