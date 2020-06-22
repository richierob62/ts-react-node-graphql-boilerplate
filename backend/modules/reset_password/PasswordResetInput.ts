import { Field, InputType } from 'type-graphql';

import { MinLength } from 'class-validator';

@InputType()
export class PasswordResetInput {
  @Field()
  @MinLength(6, { message: 'Use a longer password' })
  password: string;

  @Field()
  key: string;
}
