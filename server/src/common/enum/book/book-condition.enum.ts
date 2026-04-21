import { registerEnumType } from '@nestjs/graphql';

export enum BookCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

registerEnumType(BookCondition, {
  name: 'BookCondition',
});