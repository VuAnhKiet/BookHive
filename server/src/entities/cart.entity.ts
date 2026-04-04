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
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from './user.entity';
import { Book } from './book.entity';

@ObjectType()
@Entity('cart')
export class Cart {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column('uuid')
  user_id: string;

  @Field(() => ID)
  @Column('uuid')
  book_id: string;

  @Field(() => Int)
  @Column({ default: 1 })
  quantity: number;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @DeleteDateColumn()
  deleted_at?: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field(() => User)
  @ManyToOne(() => User, user => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Book)
  @ManyToOne(() => Book, book => book.cart)
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
