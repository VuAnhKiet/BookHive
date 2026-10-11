import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { DeliveryStatus } from '../common/enum/delivery/delivery-status.enum';

@ObjectType()
@Entity('delivery_legs')
@Unique(['delivery_id', 'sequence'])
export class DeliveryLeg {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  delivery_id!: string;

  @Field(() => ID)
  @Column('uuid')
  route_id!: string;

  @Field(() => ID)
  @Column('uuid')
  volunteer_id!: string;

  @Field(() => Int)
  @Column({ type: 'integer' })
  sequence!: number;

  @Field(() => DeliveryStatus)
  @Column({ type: 'enum', enum: DeliveryStatus })
  status!: DeliveryStatus;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @UpdateDateColumn()
  updated_at!: Date;
}
