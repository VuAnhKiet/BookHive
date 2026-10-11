import { registerEnumType } from "@nestjs/graphql";

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});