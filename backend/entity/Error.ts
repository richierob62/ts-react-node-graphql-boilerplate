import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Error {
  @Field(() => String)
  path: string;

  @Field(() => String)
  message: string;
}
