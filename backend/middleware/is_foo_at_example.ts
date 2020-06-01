import { AuthenticationError } from 'apollo-server-express';
import { Context } from '../utils/server/resolver_types';
import { MiddlewareFn } from 'type-graphql';
import { User } from '../entity/User';

export const isFooAtExample: MiddlewareFn<Context> = async (
  { context },
  next
) => {
  const user = await User.findOne(context.req.session!.userId);
  if (!user || !user.email || user.email !== 'foo@example.com')
    throw new AuthenticationError('not authorized');
  return next();
};
