import { Field, Float, InputType } from '@nestjs/graphql';
import { BookCondition } from 'src/common/enum/book/book-condition.enum';

@InputType()
export class CreateBookInput {
  @Field(() => String)
  title!: string;

  @Field(() => String)
  author!: string;

  @Field(() => String)
  genre!: string;

  @Field(() => String)
  description!: string;

  @Field(() => String)
  cover_image!: string;

  @Field(() => Float)
  rental_price_per_day!: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  late_fee_per_day?: number;

  @Field(() => BookCondition, { defaultValue: BookCondition.NEW })
  condition!: BookCondition;

}