import { Request, Response } from 'express';

import { Redis } from 'ioredis';

export type Resolver = (
  parent: any,
  args: any,
  context: {
    req: Request;
    res: Response;
    redis: Redis;
    confirmUrl: string;
  },
  info: any
) => any;

export type GraphQLMiddlewareFunction = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: { req: Request; res: Response; redis: Redis; confirmUrl: string },
  info: any
) => any;

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
