import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('delivery_relays')
@Unique(['route_id', 'sequence'])
export class DeliveryRelay {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  route_id!: string;

  @Field()
  @Column()
  location!: string;

  @Field(() => Int)
  @Column({ type: 'integer' })
  sequence!: number;

  @Field()
  @CreateDateColumn()
  created_at!: Date;
}
