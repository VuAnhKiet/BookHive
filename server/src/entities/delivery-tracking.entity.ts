import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { DeliveryStatus } from '../common/enum/delivery/delivery-status.enum';

@ObjectType()
@Entity('delivery_tracking')
export class DeliveryTracking {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  delivery_id!: string;

  @Field(() => DeliveryStatus)
  @Column({ type: 'enum', enum: DeliveryStatus })
  status!: DeliveryStatus;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  location!: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Field(() => ID)
  @Column('uuid')
  updated_by!: string;

  @Field()
  @CreateDateColumn()
  created_at!: Date;
}
