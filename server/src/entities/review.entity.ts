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
import { Store } from './store.entity';

@ObjectType()
@Entity('reviews')
export class Review {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  renter_id!: string;

  @Field(() => ID)
  @Column('uuid')
  book_id!: string;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  store_id!: string;

  @Field(() => Int)
  @Column('int')
  rating!: number;

  @Field()
  @Column('text')
  comment!: string;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @DeleteDateColumn()
  deleted_at?: Date;

  @Field()
  @UpdateDateColumn()
  updated_at!: Date;

  @Field(() => User)
  @ManyToOne(() => User, user => user.reviews)
  @JoinColumn({ name: 'renter_id' })
  renter!: User;

  @Field(() => Book)
  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Field(() => Store, { nullable: true })
  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn({ name: 'store_id' })
  store!: Store;
}
