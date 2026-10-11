import { registerEnumType } from '@nestjs/graphql';

export enum DeliveryStatus {
  REQUESTED = 'requested',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  HANDED_OVER = 'handed_over',
  IN_TRANSIT = 'in_transit',
  AT_RELAY = 'at_relay',
  COMPLETED = 'completed',
}

registerEnumType(DeliveryStatus, { name: 'DeliveryStatus' });
