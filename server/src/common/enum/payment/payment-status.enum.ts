import { registerEnumType } from "@nestjs/graphql";

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});