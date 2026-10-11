import { registerEnumType } from '@nestjs/graphql';

export enum BookTransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

registerEnumType(BookTransferStatus, { name: 'BookTransferStatus' });
