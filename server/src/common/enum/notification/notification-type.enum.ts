import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  RENTAL_DUE = 'rental_due',
  RENTAL_APPROVED = 'rental_approved',
  PAYMENT_SUCCESS = 'payment_success',
  LATE_FEE = 'late_fee',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
});