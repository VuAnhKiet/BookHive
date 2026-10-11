import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { DeliveryStatus } from '../common/enum/delivery/delivery-status.enum';

@ObjectType()
@Entity('deliveries')
export class Delivery {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  book_id!: string;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true, unique: true })
  rental_id!: string | null;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true, unique: true })
  transfer_id!: string | null;

  @Field(() => ID)
  @Column('uuid')
  requester_id!: string;

  @Field(() => ID)
  @Column('uuid')
  store_id!: string;

  @Field(() => ID)
  @Column('uuid')
  destination_store_id!: string;

  @Field()
  @Column()
  pickup_location!: string;

  @Field()
  @Column()
  delivery_location!: string;

  @Field(() => DeliveryStatus)
  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.REQUESTED })
  status!: DeliveryStatus;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  route_id!: string | null;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  volunteer_id!: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  handover_at!: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completed_at!: Date | null;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @UpdateDateColumn()
  updated_at!: Date;
}
