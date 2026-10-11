import { registerEnumType } from '@nestjs/graphql';

export enum DisputeStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

registerEnumType(DisputeStatus, { name: 'DisputeStatus' });
