import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Book } from './book.entity';
import { Rental } from './rental.entity';
import { Payment } from './payment.entity';
import { Notification } from './notification.entity';
import { Review } from './review.entity';
import { Wishlist } from './wishlist.entity';
import { Withdrawal } from './withdrawal.entity';
import { Store } from './store.entity';
import { Cart } from './cart.entity';

export enum UserRole {
  RENTER = 'renter',
  LENDER = 'lender',
  STORE_MANAGER = 'store_manager',
  ADMIN = 'admin',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string; 

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profile_image: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone_number: string;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  wallet_balance: number;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field(() => [Book])
  @OneToMany(() => Book, (book) => book.owner)
  books: Book[];

  @Field(() => [Rental])
  @OneToMany(() => Rental, (rental) => rental.renter)
  rentals: Rental[];

  @Field(() => [Payment])
  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @Field(() => [Notification])
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @Field(() => [Review])
  @OneToMany(() => Review, (review) => review.renter)
  reviews: Review[];

  @Field(() => [Wishlist])
  @OneToMany(() => Wishlist, (wishlist) => wishlist.renter)
  wishlist: Wishlist[];

  @Field(() => [Withdrawal])
  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.lender)
  withdrawals: Withdrawal[];

  @Field(() => [Store])
  @OneToMany(() => Store, (store) => store.manager)
  stores: Store[];

  @Field(() => [Cart])
  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];
}
