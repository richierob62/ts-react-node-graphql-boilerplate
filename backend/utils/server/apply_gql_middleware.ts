import { GraphQLMiddlewareFunction, Resolver } from './resolver_types';

export const applyGQLMiddleware = (
  middlewareFunction: GraphQLMiddlewareFunction,
  resolverFunction: Resolver
) => (parent: any, args: any, context: any, info: any) =>
  middlewareFunction(resolverFunction, parent, args, context, info);
