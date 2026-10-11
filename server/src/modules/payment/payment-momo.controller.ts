import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MomoIpnPayload } from './momo-ipn.interface';
import { PaymentService } from './payment.service';

@Controller('payments/momo')
export class PaymentMomoController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('ipn')
  @HttpCode(204)
  async handleIpn(@Body() payload: MomoIpnPayload): Promise<void> {
    await this.paymentService.handleMomoIpn(payload);
  }
}
