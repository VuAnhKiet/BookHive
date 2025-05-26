import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.entity';
import { Book } from './book.entity';

@ObjectType()
@Entity('wishlist')
export class Wishlist {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  renter_id: string;

  @Field()
  @Column('uuid')
  book_id: string;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field(() => User)
  @ManyToOne(() => User, user => user.wishlist)
  @JoinColumn({ name: 'renter_id' })
  renter: User;

  @Field(() => Book)
  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
