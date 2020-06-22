import { AuthenticationError } from 'apollo-server-express';
import { Context } from '../utils/server/resolver_types';
import { MiddlewareFn } from 'type-graphql';
import { User } from '../entity/User';

export const isSendAtExample: MiddlewareFn<Context> = async (
  { context },
  next
) => {
  if (!context.req.session || !context.req.session.userId)
    throw new AuthenticationError('not authorized');

  const user = await User.findOne(context.req.session.userId);

  if (!user || !user.email || user.email !== 'send@example.com')
    throw new AuthenticationError('not authorized');
  return next();
};
