import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/entities/book.entity';
import { Rental } from 'src/entities/rental.entity';
import { Review } from 'src/entities/review.entity';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Review, Rental, Book]),
  ],
  providers: [ReviewResolver, ReviewService, GqlAuthGuard],
})
export class ReviewModule {}
