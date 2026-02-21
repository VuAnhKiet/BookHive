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
import { Book } from './book.entity';
import { User } from './user.entity';
import { Store } from './store.entity';

export enum RentalStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@ObjectType()
@Entity('rentals')
export class Rental {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column('uuid')
  book_id: string;

  @Field(() => ID)
  @Column('uuid')
  renter_id: string;

  @Field(() => ID)
  @Column('uuid')
  store_id: string;

  @Field()
  @Column({ type: 'timestamp' })
  rental_start_date: Date;

  @Field()
  @Column({ type: 'timestamp' })
  rental_due_date: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  return_date: Date;

  @Field()
  @Column({ type: 'enum', enum: RentalStatus })
  status: RentalStatus;

  @Field()
  @Column({ type: 'boolean', default: false })
  late_fee_paid: boolean;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Field()
  @Column({ type: 'enum', enum: PaymentStatus })
  payment_status: PaymentStatus;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @DeleteDateColumn()
  deleted_at?: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field(() => Book)
  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Field(() => User)
  @ManyToOne(() => User, user => user.rentals)
  @JoinColumn({ name: 'renter_id' })
  renter: User;

  @Field(() => Store)
  @ManyToOne(() => Store, store => store.rentals)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
