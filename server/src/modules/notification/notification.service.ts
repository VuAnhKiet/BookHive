import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationStatus } from '../../common/enum/notification/notification-status.enum';
import { NotificationType } from '../../common/enum/notification/notification-type.enum';
import { UserRole } from '../../common/enum/user/user-role.enum';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    userId: string,
    message: string,
    type: NotificationType,
  ): Promise<Notification> {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) {
      throw new BadRequestException('Notification message cannot be empty');
    }
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.notificationRepository.save(
      this.notificationRepository.create({
        user_id: userId,
        message: normalizedMessage,
        type,
        status: NotificationStatus.UNREAD,
      }),
    );
  }

  async send(
    userId: string,
    message: string,
    type: NotificationType,
    senderRole: string,
  ): Promise<Notification> {
    if (senderRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only an administrator can send notifications');
    }
    return this.create(userId, message, type);
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.findOwnedNotification(
      notificationId,
      userId,
    );
    notification.status = NotificationStatus.READ;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    await this.notificationRepository.update(
      { user_id: userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ },
    );
    return true;
  }

  async delete(
    notificationId: string,
    userId: string,
    userRole: string,
  ): Promise<boolean> {
    const notification = await this.notificationRepository.findOneBy({
      id: notificationId,
    });
    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }
    if (
      notification.user_id !== userId &&
      userRole !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You cannot delete this notification');
    }
    await this.notificationRepository.softRemove(notification);
    return true;
  }

  private async findOwnedNotification(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({
      id: notificationId,
      user_id: userId,
    });
    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }
    return notification;
  }
}
