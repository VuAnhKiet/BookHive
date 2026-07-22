import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
  DeleteDateColumn
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from './user.entity';
import { WithdrawalStatus } from '../common/enum/payment/withdrawal-status.enum';


@ObjectType()
@Entity('withdrawals')
export class Withdrawal {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column('uuid')
  lender_id!: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Field(() => String)
  @Column({ type: 'enum', enum: WithdrawalStatus })
  status!: WithdrawalStatus;

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
  @ManyToOne(() => User, user => user.withdrawals)
  @JoinColumn({ name: 'lender_id' })
  lender!: User;
}
