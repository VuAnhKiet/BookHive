import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { NotificationType } from 'src/common/enum/notification/notification-type.enum';
import { Notification } from 'src/entities/notification.entity';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { NotificationService } from './notification.service';

@Resolver(() => Notification)
@UseGuards(GqlAuthGuard)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Mutation(() => Notification)
  create(
    @CurrentUser() user: JwtPayload,
    @Args('message') message: string,
    @Args('type', { type: () => NotificationType }) type: NotificationType,
  ) {
    return this.notificationService.create(user.id, message, type);
  }

  @Mutation(() => Notification)
  send(
    @CurrentUser() user: JwtPayload,
    @Args('userId') userId: string,
    @Args('message') message: string,
    @Args('type', { type: () => NotificationType }) type: NotificationType,
  ) {
    return this.notificationService.send(userId, message, type, user.role);
  }

  @Query(() => [Notification], { name: 'myNotifications' })
  findByUser(@CurrentUser() user: JwtPayload) {
    return this.notificationService.findByUser(user.id);
  }

  @Mutation(() => Notification)
  markAsRead(
    @CurrentUser() user: JwtPayload,
    @Args('notificationId') notificationId: string,
  ) {
    return this.notificationService.markAsRead(notificationId, user.id);
  }

  @Mutation(() => Boolean)
  markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Mutation(() => Boolean)
  delete(
    @CurrentUser() user: JwtPayload,
    @Args('notificationId') notificationId: string,
  ) {
    return this.notificationService.delete(
      notificationId,
      user.id,
      user.role,
    );
  }
}
