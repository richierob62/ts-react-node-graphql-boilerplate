import { AuthenticationError } from 'apollo-server-express';
import { Context } from '../utils/server/resolver_types';
import { MiddlewareFn } from 'type-graphql';

export const isAuthenticated: MiddlewareFn<Context> = async (
  { context },
  next
) => {
  if (!context.req.session!.userId)
    throw new AuthenticationError('not authorized');

  return next();
};
