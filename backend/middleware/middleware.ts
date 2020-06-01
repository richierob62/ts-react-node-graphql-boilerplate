import { Resolver } from '../utils/server/resolver_types';

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  // before
  const result = await resolver(parent, args, context, info);
  // after
  return result;
};
