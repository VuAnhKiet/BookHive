import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaymentMethod } from 'src/common/enum/payment/payment-method.enum';
import { Payment } from 'src/entities/payment.entity';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { MomoPaymentCheckout } from './model/momo-payment-checkout.model';
import { PaymentService } from './payment.service';

@Resolver(() => Payment)
@UseGuards(GqlAuthGuard)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) { }

  @Mutation(() => Payment)
  createPayment(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
    @Args('paymentMethod', { type: () => PaymentMethod })
    paymentMethod: PaymentMethod,
  ) {
    return this.paymentService.createPayment(
      rentalId,
      paymentMethod,
      user.id,
    );
  }

  @Mutation(() => Payment)
  payRentalWithWallet(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
  ) {
    return this.paymentService.payRentalWithWallet(rentalId, user.id);
  }

  @Mutation(() => MomoPaymentCheckout)
  startMomoPayment(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
  ) {
    return this.paymentService.startMomoPayment(rentalId, user.id);
  }

  @Mutation(() => Payment)
  processPayment(
    @CurrentUser() user: JwtPayload,
    @Args('paymentId') paymentId: string,
  ) {
    return this.paymentService.processPayment(paymentId, user.id);
  }

  @Query(() => Payment)
  getPayment(
    @CurrentUser() user: JwtPayload,
    @Args('paymentId') paymentId: string,
  ) {
    return this.paymentService.getPayment(
      paymentId,
      user.id,
      user.role,
    );
  }

  @Query(() => [Payment])
  getUserPayments(@CurrentUser() user: JwtPayload) {
    return this.paymentService.getUserPayments(user.id);
  }

  /*
  @Mutation(() => Payment)
  verifyPayment(
    @CurrentUser() user: JwtPayload,
    @Args('paymentId') paymentId: string,
    @Args('status', { type: () => PaymentStatus })
    status: PaymentStatus
  ) {
    if (
      status !== PaymentStatus.COMPLETED &&
      status !== PaymentStatus.FAILED
    ) {
      throw new BadRequestException('Payment verification must complete or fail the payment');
    }
    return this.paymentService.verifyPayment(
      paymentId,
      status,
      user.role,
    );
  }
  */

  @Mutation(() => Payment)
  refund(
    @CurrentUser() user: JwtPayload,
    @Args('paymentId') paymentId: string,
  ) {
    return this.paymentService.refund(paymentId, user.id, user.role);
  }
}
