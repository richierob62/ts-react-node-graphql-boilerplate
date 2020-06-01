import { Field, InputType } from 'type-graphql';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

import { EmailAlreadyUsed } from './is_email_already_used';
import { User } from '../../entity/User';

@InputType()
export class RegisterInput implements Partial<User> {
  @Field()
  @IsEmail({}, { message: 'Please enter a valid email' })
  @EmailAlreadyUsed({ message: 'That email is already registered' })
  email: string;

  @Field()
  @MinLength(6, { message: 'Use a longer password' })
  password: string;

  @Field({ nullable: true })
  @MaxLength(255, { message: 'That first name is way too long' })
  firstName: string;

  @Field({ nullable: true })
  @MaxLength(255, { message: 'That last name is way too long' })
  lastName: string;
}
