import { Field, ObjectType } from '@nestjs/graphql';
import { Payment } from '../../../entities/payment.entity';

@ObjectType()
export class MomoPaymentCheckout {
  @Field(() => Payment)
  payment!: Payment;

  @Field()
  payUrl!: string;

  @Field({ nullable: true })
  qrCodeUrl?: string;

  @Field({ nullable: true })
  deeplink?: string;
}
