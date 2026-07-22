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
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Rental } from './rental.entity';
import { Payment } from './payment.entity';

@ObjectType()
@Entity('late_fees')
export class LateFee {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  rental_id!: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount_due!: number;

  @Field()
  @Column({ type: 'boolean', default: false })
  paid!: boolean;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  payment_id!: string;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @DeleteDateColumn()
  deleted_at?: Date;

  @Field()
  @UpdateDateColumn()
  updated_at!: Date;

  @Field(() => Rental)
  @ManyToOne(() => Rental)
  @JoinColumn({ name: 'rental_id' })
  rental!: Rental;

  @Field(() => Payment, { nullable: true })
  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment!: Payment;
}
