import { registerEnumType } from '@nestjs/graphql';

export enum RentalStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

registerEnumType(RentalStatus, {
  name: 'RentalStatus',
});