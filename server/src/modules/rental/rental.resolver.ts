import { UseGuards } from '@nestjs/common';
import {
  Args,
  Float,
  GraphQLISODateTime,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Rental } from 'src/entities/rental.entity';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { RentalService } from './rental.service';

@Resolver(() => Rental)
export class RentalResolver {
  constructor(private readonly rentalService: RentalService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Rental)
  createRequest(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
    @Args('rentalStartDate') rentalStartDate: string,
    @Args('rentalDueDate') rentalDueDate: string,
    @Args('timezoneOffsetMinutes', { type: () => Int })
    timezoneOffsetMinutes: number,
  ) {
    return this.rentalService.createRequest(
      bookId,
      user.id,
      rentalStartDate,
      rentalDueDate,
      timezoneOffsetMinutes,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Rental)
  getRequest(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
  ) {
    return this.rentalService.getRequest(rentalId, user.id, user.role);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Rental])
  getUserRentals(@CurrentUser() user: JwtPayload) {
    return this.rentalService.getUserRentals(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Rental])
  getStoreRentalRequests(@CurrentUser() user: JwtPayload) {
    return this.rentalService.getStoreRentalRequests(user.id, user.role);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Rental)
  approveRequest(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
  ) {
    return this.rentalService.approveRequest(rentalId, user.id, user.role);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Rental)
  rejectRequest(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
  ) {
    return this.rentalService.rejectRequest(rentalId, user.id, user.role);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Rental)
  checkout(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
  ) {
    return this.rentalService.checkout(rentalId, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Rental)
  returnBook(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
  ) {
    return this.rentalService.returnBook(rentalId, user.id, user.role);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Rental)
  cancelRequest(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
  ) {
    return this.rentalService.cancelRequest(rentalId, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Float)
  calculateFee(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
    @Args('returnDate', {
      type: () => GraphQLISODateTime,
      nullable: true,
    })
    returnDate?: Date,
  ) {
    return this.rentalService.calculateFee(
      rentalId,
      user.id,
      user.role,
      returnDate,
    );
  }
}
