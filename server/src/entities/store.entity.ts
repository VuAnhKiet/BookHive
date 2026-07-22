import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.entity';
import { Book } from './book.entity';
import { Rental } from './rental.entity';

@ObjectType()
@Entity('stores')
export class Store {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  location!: string;

  @Field(() => ID)
  @Column('uuid')
  store_manager_id!: string;

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
  @ManyToOne(() => User, user => user.stores)
  @JoinColumn({ name: 'store_manager_id' })
  manager!: User;

  @Field(() => [Book])
  @OneToMany(() => Book, book => book.store)
  books!: Book[];

  @Field(() => [Rental])
  @OneToMany(() => Rental, rental => rental.store)
  rentals!: Rental[];
}
