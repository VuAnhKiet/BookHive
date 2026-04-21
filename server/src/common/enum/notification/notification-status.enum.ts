import { registerEnumType } from "@nestjs/graphql"; 

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
});