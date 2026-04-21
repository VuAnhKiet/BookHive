import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  USER = 'user',
  STORE_MANAGER = 'store_manager',
  ADMIN = 'admin',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});