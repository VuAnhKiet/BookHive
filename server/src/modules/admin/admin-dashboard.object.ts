import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminDashboard {
  @Field(() => Int)
  users!: number;

  @Field(() => Int)
  books!: number;

  @Field(() => Int)
  pendingBooks!: number;

  @Field(() => Int)
  pendingTransfers!: number;

  @Field(() => Int)
  openDisputes!: number;
}
