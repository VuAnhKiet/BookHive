import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
  DeleteDateColumn
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from './user.entity';
import { Store } from './store.entity';
import { Cart } from './cart.entity';

@ObjectType() 
@Entity('books')
export class Book {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  author: string;

  @Field()
  @Column()
  genre: string;

  @Field()
  @Column('text')
  description: string;

  @Field()
  @Column()
  cover_image: string;

  @Field()
  @Column({ type: 'enum', enum: ['available', 'rented', 'pending_approval', 'rejected', 'lost'] })
  status: 'available' | 'rented' | 'pending_approval' | 'rejected' | 'lost';

  @Column('uuid')
  owner_id: string;

  @Column('uuid')
  store_id: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rental_price_per_day: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  late_fee_per_day: number;

  @Field()
  @Column({ type: 'enum', enum: ['new', 'good', 'fair', 'poor'] })
  condition: 'new' | 'good' | 'fair' | 'poor';

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @DeleteDateColumn()
  deleted_at?: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.books)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Store, store => store.books)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => Cart, cart => cart.book)
  cart: Cart[];
}
