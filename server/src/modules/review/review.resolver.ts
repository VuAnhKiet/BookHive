import { UseGuards } from '@nestjs/common';
import { Args, Float, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Review } from 'src/entities/review.entity';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { ReviewService } from './review.service';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Review)
  create(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
    @Args('rentalId') rentalId: string,
    @Args('rating', { type: () => Int }) rating: number,
    @Args('comment') comment: string,
  ) {
    return this.reviewService.create(
      bookId,
      rentalId,
      user.id,
      rating,
      comment,
    );
  }

  @Query(() => [Review])
  findByBook(@Args('bookId') bookId: string) {
    return this.reviewService.findByBook(bookId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Review], { name: 'myReviews' })
  findByUser(@CurrentUser() user: JwtPayload) {
    return this.reviewService.findByUser(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Review)
  update(
    @CurrentUser() user: JwtPayload,
    @Args('reviewId') reviewId: string,
    @Args('rating', { type: () => Int, nullable: true }) rating?: number,
    @Args('comment', { nullable: true }) comment?: string,
  ) {
    return this.reviewService.update(
      reviewId,
      user.id,
      user.role,
      rating,
      comment,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  delete(
    @CurrentUser() user: JwtPayload,
    @Args('reviewId') reviewId: string,
  ) {
    return this.reviewService.delete(reviewId, user.id, user.role);
  }

  @Query(() => Float)
  calculateRating(@Args('bookId') bookId: string) {
    return this.reviewService.calculateRating(bookId);
  }
}
