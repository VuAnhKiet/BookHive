import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.entity';
import { NotificationType } from '../common/enum/notification/notification-type.enum';
import { NotificationStatus } from '../common/enum/notification/notification-status.enum';

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  user_id!: string;

  @Field()
  @Column('text')
  message!: string;

  @Field()
  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Field()
  @Column({ type: 'enum', enum: NotificationStatus })
  status!: NotificationStatus;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @DeleteDateColumn()
  deleted_at?: Date;

  @Field()
  @UpdateDateColumn()
  updated_at!: Date;

  @Field(() => User)
  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
