import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class RegisterInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  confirmPassword!: string;

}