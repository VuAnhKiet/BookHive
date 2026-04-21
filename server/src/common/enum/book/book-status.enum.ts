import { registerEnumType } from '@nestjs/graphql';

export enum BookStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  PENDING_APPROVAL = 'pending_approval',
  TRANSFERRING = 'transferring',
  REJECTED = 'rejected',
  LOST = 'lost',
  DAMAGED = 'damaged',
}

registerEnumType(BookStatus, {
  name: 'BookStatus',
});