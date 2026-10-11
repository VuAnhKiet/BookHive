import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class BookStatusInput {
    @Field(() => String)
    id!: string;

    @Field(() => String)
    status!: string;

}