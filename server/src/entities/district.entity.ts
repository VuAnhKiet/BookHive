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
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { City } from './city.entity';

@ObjectType()
@Entity('districts')
export class District {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => ID)
  @Column('uuid')
  city_id: string;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @DeleteDateColumn()
  deleted_at?: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field(() => City)
  @ManyToOne(() => City, city => city.districts)
  @JoinColumn({ name: 'city_id' })
  city: City;
}
