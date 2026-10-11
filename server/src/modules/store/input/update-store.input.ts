import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateStoreInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  store_manager_id?: string;
}
