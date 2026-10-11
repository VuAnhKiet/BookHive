import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
} from '@nestjs/graphql';
import { BookTransferStatus } from '../common/enum/admin/book-transfer-status.enum';

@ObjectType()
@Entity('book_transfers')
export class BookTransfer {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID)
  @Column('uuid')
  book_id!: string;

  @Field(() => ID)
  @Column('uuid')
  source_store_id!: string;

  @Field(() => ID)
  @Column('uuid')
  destination_store_id!: string;

  @Field(() => ID)
  @Column('uuid')
  requested_by!: string;

  @Field(() => BookTransferStatus)
  @Column({ type: 'enum', enum: BookTransferStatus })
  status!: BookTransferStatus;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  decision_note!: string | null;

  @Field(() => ID, { nullable: true })
  @Column('uuid', { nullable: true })
  decided_by!: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  decided_at!: Date | null;

  @Field()
  @CreateDateColumn()
  created_at!: Date;

  @Field()
  @UpdateDateColumn()
  updated_at!: Date;
}
