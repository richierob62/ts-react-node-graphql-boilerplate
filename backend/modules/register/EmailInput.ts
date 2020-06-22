import { Field, InputType } from 'type-graphql';

import { IsEmail } from 'class-validator';
import { User } from '../../entity/User';

@InputType()
export class EmailInput implements Partial<User> {
  @Field()
  @IsEmail({}, { message: 'Please enter a valid email' })
  email: string;
}
