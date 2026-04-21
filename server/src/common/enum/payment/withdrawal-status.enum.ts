import { registerEnumType } from '@nestjs/graphql';

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

registerEnumType(WithdrawalStatus, {
  name: 'WithdrawalStatus',
});