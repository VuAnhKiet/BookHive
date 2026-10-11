import { registerEnumType } from '@nestjs/graphql';

export enum RentalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

registerEnumType(RentalStatus, {
  name: 'RentalStatus',
});