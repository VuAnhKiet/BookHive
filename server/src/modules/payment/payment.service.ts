import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { PaymentMethod } from '../../common/enum/payment/payment-method.enum';
import { PaymentStatus } from '../../common/enum/payment/payment-status.enum';
import { RentalStatus } from '../../common/enum/user/rental-status.enum';
import { UserRole } from '../../common/enum/user/user-role.enum';
import { Payment } from '../../entities/payment.entity';
import { Rental } from '../../entities/rental.entity';
import { User } from '../../entities/user.entity';
import { Notification } from '../../entities/notification.entity';
import { NotificationStatus } from '../../common/enum/notification/notification-status.enum';
import { NotificationType } from '../../common/enum/notification/notification-type.enum';
import { MomoIpnPayload } from './momo-ipn.interface';
import { MomoPaymentCheckout } from './model/momo-payment-checkout.model';

const MOMO_SANDBOX_API_URL = 'https://test-payment.momo.vn/v2/gateway/api/create';

type MomoConfig = {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  redirectUrl: string;
  ipnUrl: string;
  apiUrl: string;
};

type MomoCreateResponse = {
  resultCode: number;
  message?: string;
  payUrl?: string;
  qrCodeUrl?: string;
  deeplink?: string;
};

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async createPayment(
    rentalId: string,
    paymentMethod: PaymentMethod,
    userId: string,
  ): Promise<Payment> {
    if (paymentMethod === PaymentMethod.MOMO) {
      throw new BadRequestException(
        'Use startMomoPayment to create and initialize a MoMo checkout',
      );
    }

    return this.createPendingPayment(rentalId, paymentMethod, userId);
  }

  async startMomoPayment(
    rentalId: string,
    userId: string,
  ): Promise<MomoPaymentCheckout> {
    const config = this.getMomoConfig();
    const payment = await this.createPendingPayment(
      rentalId,
      PaymentMethod.MOMO,
      userId,
    );
    const amount = Number(payment.amount);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      await this.markMomoPaymentFailed(payment.id);
      throw new BadRequestException(
        'MoMo payments require a positive whole-number amount in VND',
      );
    }

    const requestId = randomUUID();
    const orderInfo = `BookHive rental payment ${payment.rental_id}`;
    const requestType = 'captureWallet';
    const extraData = '';
    const signaturePayload =
      `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${config.ipnUrl}&orderId=${payment.id}&orderInfo=${orderInfo}` +
      `&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;
    const signature = createHmac('sha256', config.secretKey)
      .update(signaturePayload)
      .digest('hex');

    let momoResponse: MomoCreateResponse;
    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerCode: config.partnerCode,
          requestId,
          amount,
          orderId: payment.id,
          orderInfo,
          redirectUrl: config.redirectUrl,
          ipnUrl: config.ipnUrl,
          lang: 'vi',
          requestType,
          autoCapture: true,
          extraData,
          signature,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      try {
        momoResponse = (await response.json()) as MomoCreateResponse;
      } catch {
        throw new BadGatewayException(
          'MoMo returned an invalid checkout response',
        );
      }

      if (!response.ok || momoResponse.resultCode !== 0) {
        throw new BadGatewayException(
          `MoMo could not initialize checkout (result code ${momoResponse.resultCode})`,
        );
      }
      if (!momoResponse.payUrl || !this.isHttpsUrl(momoResponse.payUrl)) {
        throw new BadGatewayException('MoMo returned an invalid checkout URL');
      }
    } catch (error) {
      await this.markMomoPaymentFailed(payment.id);
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new BadGatewayException('Could not connect to MoMo checkout');
    }

    return {
      payment,
      payUrl: momoResponse.payUrl,
      ...(momoResponse.qrCodeUrl ? { qrCodeUrl: momoResponse.qrCodeUrl } : {}),
      ...(momoResponse.deeplink ? { deeplink: momoResponse.deeplink } : {}),
    };
  }

  private async createPendingPayment(
    rentalId: string,
    paymentMethod: PaymentMethod,
    userId: string,
  ): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const rental = await manager.getRepository(Rental).findOne({
        where: { id: rentalId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rental) {
        throw new NotFoundException(`Rental with ID ${rentalId} not found`);
      }
      if (rental.renter_id !== userId) {
        throw new ForbiddenException('Only the renter can pay for this rental');
      }
      if (
        rental.status !== RentalStatus.APPROVED &&
        rental.status !== RentalStatus.ACTIVE
      ) {
        throw new BadRequestException(
          'Payments are only accepted for approved or active rentals',
        );
      }
      const amount = Number(rental.total_amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('Rental amount must be greater than zero');
      }
      if (rental.payment_status === PaymentStatus.COMPLETED) {
        throw new BadRequestException('This rental has already been paid');
      }
      if (rental.payment_status === PaymentStatus.REFUNDED) {
        throw new BadRequestException('A refunded rental cannot be paid again');
      }

      const pendingPayment = await manager.getRepository(Payment).findOneBy({
        rental_id: rental.id,
        user_id: userId,
        status: PaymentStatus.PENDING,
      });
      if (pendingPayment) {
        throw new BadRequestException(
          'This rental already has a pending payment',
        );
      }

      return manager.getRepository(Payment).save(
        manager.getRepository(Payment).create({
          user_id: userId,
          rental_id: rental.id,
          amount,
          status: PaymentStatus.PENDING,
          payment_method: paymentMethod,
          transaction_date: new Date(),
        }),
      );
    });
  }

  async payRentalWithWallet(
    rentalId: string,
    userId: string,
  ): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const rentalRepository = manager.getRepository(Rental);
      const rental = await rentalRepository.findOne({
        where: { id: rentalId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rental) {
        throw new NotFoundException(`Rental request with ID ${rentalId} not found`);
      }
      if (rental.renter_id !== userId) {
        throw new ForbiddenException('Only the renter can pay for this rental');
      }
      if (
        rental.status !== RentalStatus.APPROVED &&
        rental.status !== RentalStatus.ACTIVE
      ) {
        throw new BadRequestException(
          'Payments are only accepted for approved or active rentals',
        );
      }
      if (rental.payment_status === PaymentStatus.COMPLETED) {
        throw new BadRequestException('This rental has already been paid');
      }
      if (rental.payment_status === PaymentStatus.REFUNDED) {
        throw new BadRequestException('A refunded rental cannot be paid again');
      }

      const amount = Number(rental.total_amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('Rental amount must be greater than zero');
      }

      const paymentRepository = manager.getRepository(Payment);
      let payment = await paymentRepository.findOne({
        where: {
          rental_id: rental.id,
          user_id: userId,
          status: PaymentStatus.PENDING,
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (payment && payment.payment_method !== PaymentMethod.WALLET) {
        throw new BadRequestException(
          'This rental already has a pending payment with another method',
        );
      }
      if (payment && Number(payment.amount) !== amount) {
        throw new BadRequestException(
          'Pending payment amount does not match the rental amount',
        );
      }

      const userRepository = manager.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const balance = Number(user.wallet_balance);
      if (!Number.isFinite(balance) || balance < amount) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      if (!payment) {
        payment = paymentRepository.create({
          user_id: userId,
          rental_id: rental.id,
          amount,
          status: PaymentStatus.PENDING,
          payment_method: PaymentMethod.WALLET,
          transaction_date: new Date(),
        });
      }

      user.wallet_balance = balance - amount;
      rental.payment_status = PaymentStatus.COMPLETED;
      payment.status = PaymentStatus.COMPLETED;
      await userRepository.save(user);
      await rentalRepository.save(rental);
      await manager.getRepository(Notification).save({
        user_id: userId,
        message: 'Your rental payment was completed successfully.',
        type: NotificationType.PAYMENT_SUCCESS,
        status: NotificationStatus.UNREAD,
      });
      return paymentRepository.save(payment);
    });
  }

  async handleMomoIpn(payload: MomoIpnPayload): Promise<void> {
    const config = this.getMomoConfig();
    if (
      payload?.partnerCode !== config.partnerCode ||
      !this.isValidMomoSignature(payload, config)
    ) {
      throw new ForbiddenException('Invalid MoMo notification signature');
    }

    const amount = Number(payload.amount);
    const resultCode = Number(payload.resultCode);
    if (!Number.isSafeInteger(amount) || !Number.isSafeInteger(resultCode)) {
      throw new BadRequestException('MoMo notification has invalid numeric fields');
    }

    await this.dataSource.transaction(async (manager) => {
      const paymentRepository = manager.getRepository(Payment);
      const payment = await paymentRepository.findOne({
        where: { id: payload.orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) {
        throw new NotFoundException('MoMo payment was not found');
      }
      if (
        payment.payment_method !== PaymentMethod.MOMO ||
        Number(payment.amount) !== amount
      ) {
        throw new BadRequestException(
          'MoMo notification does not match the payment',
        );
      }

      const paymentStatus =
        resultCode === 0 ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
      if (payment.status === paymentStatus) {
        return;
      }
      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('MoMo payment has already been finalized');
      }

      const rentalRepository = manager.getRepository(Rental);
      const rental = await rentalRepository.findOne({
        where: { id: payment.rental_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rental) {
        throw new NotFoundException(
          `Rental with ID ${payment.rental_id} not found`,
        );
      }

      payment.status = paymentStatus;
      rental.payment_status = paymentStatus;
      await rentalRepository.save(rental);
      if (paymentStatus === PaymentStatus.COMPLETED) {
        await manager.getRepository(Notification).save({
          user_id: payment.user_id,
          message: 'Your MoMo rental payment was completed successfully.',
          type: NotificationType.PAYMENT_SUCCESS,
          status: NotificationStatus.UNREAD,
        });
      }
      await paymentRepository.save(payment);
    });
  }

  private getMomoConfig(): MomoConfig {
    const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
    const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
    const redirectUrl = this.configService.get<string>('MOMO_REDIRECT_URL');
    const ipnUrl = this.configService.get<string>('MOMO_IPN_URL');
    const apiUrl =
      this.configService.get<string>('MOMO_API_URL') ?? MOMO_SANDBOX_API_URL;

    const missing = [
      ['MOMO_PARTNER_CODE', partnerCode],
      ['MOMO_ACCESS_KEY', accessKey],
      ['MOMO_SECRET_KEY', secretKey],
      ['MOMO_REDIRECT_URL', redirectUrl],
      ['MOMO_IPN_URL', ipnUrl],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);
    if (missing.length) {
      throw new ServiceUnavailableException(
        `MoMo is not configured: ${missing.join(', ')}`,
      );
    }

    if (
      !this.isHttpsUrl(apiUrl) ||
      !this.isHttpOrHttpsUrl(redirectUrl!) ||
      !this.isHttpsUrl(ipnUrl!)
    ) {
      throw new ServiceUnavailableException(
        'MoMo API and IPN URLs must use HTTPS, and the redirect URL must be a valid HTTP(S) URL',
      );
    }

    return {
      partnerCode: partnerCode!,
      accessKey: accessKey!,
      secretKey: secretKey!,
      redirectUrl: redirectUrl!,
      ipnUrl: ipnUrl!,
      apiUrl,
    };
  }

  private isValidMomoSignature(
    payload: MomoIpnPayload,
    config: MomoConfig,
  ): boolean {
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.signature !== 'string' ||
      !/^[a-f\d]{64}$/i.test(payload.signature)
    ) {
      return false;
    }

    const signedPayload =
      `accessKey=${config.accessKey}&amount=${payload.amount}` +
      `&extraData=${payload.extraData}&message=${payload.message}` +
      `&orderId=${payload.orderId}&orderInfo=${payload.orderInfo}` +
      `&orderType=${payload.orderType}&partnerCode=${payload.partnerCode}` +
      `&payType=${payload.payType}&requestId=${payload.requestId}` +
      `&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}` +
      `&transId=${payload.transId}`;
    const expected = createHmac('sha256', config.secretKey)
      .update(signedPayload)
      .digest();
    const actual = Buffer.from(payload.signature, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private async markMomoPaymentFailed(paymentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const paymentRepository = manager.getRepository(Payment);
      const payment = await paymentRepository.findOne({
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment || payment.status !== PaymentStatus.PENDING) {
        return;
      }

      payment.status = PaymentStatus.FAILED;
      await paymentRepository.save(payment);
      const rentalRepository = manager.getRepository(Rental);
      const rental = await rentalRepository.findOne({
        where: { id: payment.rental_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (rental) {
        rental.payment_status = PaymentStatus.FAILED;
        await rentalRepository.save(rental);
      }
    });
  }

  private isHttpsUrl(value: string): boolean {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isHttpOrHttpsUrl(value: string): boolean {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }

  async processPayment(paymentId: string, userId: string): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const paymentRepository = manager.getRepository(Payment);
      const payment = await paymentRepository.findOne({
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }
      this.assertPaymentOwner(payment, userId);
      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Only pending payments can be processed');
      }
      if (payment.payment_method !== PaymentMethod.WALLET) {
        throw new BadRequestException(
          'Only wallet payments can be processed here; use the provider checkout for external payments',
        );
      }

      const userRepository = manager.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const balance = Number(user.wallet_balance);
      const amount = Number(payment.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than zero');
      }
      if (!Number.isFinite(balance) || balance < amount) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      user.wallet_balance = balance - amount;
      payment.status = PaymentStatus.COMPLETED;
      const rentalRepository = manager.getRepository(Rental);
      const rental = await rentalRepository.findOne({
        where: { id: payment.rental_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rental) {
        throw new NotFoundException(`Rental with ID ${payment.rental_id} not found`);
      }

      rental.payment_status = PaymentStatus.COMPLETED;
      await userRepository.save(user);
      await rentalRepository.save(rental);
      await manager.getRepository(Notification).save({
        user_id: userId,
        message: 'Your rental payment was completed successfully.',
        type: NotificationType.PAYMENT_SUCCESS,
        status: NotificationStatus.UNREAD,
      });
      return paymentRepository.save(payment);
    });
  }

  async getPayment(
    paymentId: string,
    userId: string,
    userRole: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id: paymentId });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }
    if (userRole !== UserRole.ADMIN) {
      this.assertPaymentOwner(payment, userId);
    }
    return payment;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { user_id: userId },
      relations: { rental: true },
      order: { created_at: 'DESC' },
    });
  }

  /*
  async verifyPayment(
    paymentId: string,
    status: PaymentStatus.COMPLETED | PaymentStatus.FAILED,
    verifierRole: string,
  ): Promise<Payment> {
    if (verifierRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only an administrator can verify payments');
    }
    if (
      status !== PaymentStatus.COMPLETED &&
      status !== PaymentStatus.FAILED
    ) {
      throw new BadRequestException(
        'Payment verification must complete or fail the payment',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const paymentRepository = manager.getRepository(Payment);
      const payment = await paymentRepository.findOne({
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }
      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Only pending payments can be verified');
      }
      if (payment.payment_method === PaymentMethod.WALLET) {
        throw new BadRequestException(
          'Wallet payments are verified automatically when processed',
        );
      }

      const rentalRepository = manager.getRepository(Rental);
      const rental = await rentalRepository.findOne({
        where: { id: payment.rental_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rental) {
        throw new NotFoundException(`Rental with ID ${payment.rental_id} not found`);
      }

      payment.status = status;
      rental.payment_status = status;
      await rentalRepository.save(rental);
      if (status === PaymentStatus.COMPLETED) {
        await manager.getRepository(Notification).save({
          user_id: payment.user_id,
          message: 'Your rental payment was verified successfully.',
          type: NotificationType.PAYMENT_SUCCESS,
          status: NotificationStatus.UNREAD,
        });
      }
      return paymentRepository.save(payment);
    });
  }
  */

  async refund(
    paymentId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<Payment> {
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only an administrator can refund payments');
    }

    return this.dataSource.transaction(async (manager) => {
      const paymentRepository = manager.getRepository(Payment);
      const payment = await paymentRepository.findOne({
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }
      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException('Only completed payments can be refunded');
      }
      if (payment.payment_method !== PaymentMethod.WALLET) {
        throw new BadRequestException(
          'Refunding card and bank-transfer payments requires a configured payment provider',
        );
      }

      const userRepository = manager.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: payment.user_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${payment.user_id} not found`);
      }
      const rentalRepository = manager.getRepository(Rental);
      const rental = await rentalRepository.findOne({
        where: { id: payment.rental_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!rental) {
        throw new NotFoundException(`Rental with ID ${payment.rental_id} not found`);
      }

      user.wallet_balance = Number(user.wallet_balance) + Number(payment.amount);
      payment.status = PaymentStatus.REFUNDED;
      rental.payment_status = PaymentStatus.REFUNDED;
      await userRepository.save(user);
      await rentalRepository.save(rental);
      return paymentRepository.save(payment);
    });
  }

  private assertPaymentOwner(payment: Payment, userId: string): void {
    if (payment.user_id !== userId) {
      throw new ForbiddenException('You cannot access this payment');
    }
  }
}
