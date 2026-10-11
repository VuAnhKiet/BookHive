import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
    @Field(() => String)
    token!: string;

    @Field()
    newPassword!: string;

    @Field(() => String)
    confirmPassword!: string;
}