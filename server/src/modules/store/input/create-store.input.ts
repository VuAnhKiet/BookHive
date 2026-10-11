import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateStoreInput {
  @Field()
  name!: string;

  @Field()
  location!: string;

  @Field()
  store_manager_id!: string;
}
