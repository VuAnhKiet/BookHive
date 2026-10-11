import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
} from '@nestjs/graphql';
import { DisputeStatus } from '../common/enum/admin/dispute-status.enum';

@ObjectType()
@Entity('disputes')
export class Dispute {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  reported_by!: string;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  rental_id!: string | null;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  delivery_id!: string | null;

  @Field()
  @Column({ type: 'text' })
  reason!: string;

  @Field(() => DisputeStatus)
  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  status!: DisputeStatus;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  resolution!: string | null;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  handled_by!: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  handled_at!: Date | null;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @UpdateDateColumn()
  updated_at!: Date;
}
