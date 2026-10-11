import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('delivery_routes')
export class DeliveryRoute {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  volunteer_id!: string;

  @Field()
  @Column()
  origin_location!: string;

  @Field()
  @Column()
  destination_location!: string;

  @Field()
  @Column({ type: 'date' })
  travel_date!: Date;

  @Field(() => Int)
  @Column({ type: 'integer' })
  capacity!: number;

  @Field()
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @UpdateDateColumn()
  updated_at!: Date;
}
