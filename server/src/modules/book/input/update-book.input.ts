import { Field, Float, InputType } from '@nestjs/graphql';
import { BookCondition } from 'src/common/enum/book/book-condition.enum';

@InputType()
export class UpdateBookInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  author?: string;

  @Field(() => String, { nullable: true })
  genre?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  cover_image?: string;

  @Field(() => Float, { nullable: true })
  rental_price_per_day?: number;

  @Field(() => Float, { nullable: true })
  late_fee_per_day?: number;

  @Field(() => BookCondition, { nullable: true })
  condition?: BookCondition;

}
