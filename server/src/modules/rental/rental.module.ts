import { Module } from '@nestjs/common';
import { RentalService } from './rental.service';
import { RentalResolver } from './rental.resolver';

@Module({
  providers: [RentalResolver, RentalService],
})
export class RentalModule {}
