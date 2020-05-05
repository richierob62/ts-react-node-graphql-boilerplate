import { ResolverMap } from '../../utils/server/resolver_types';
import { User } from '../../entity/User';
import { applyGQLMiddleware } from '../../utils/server/apply_gql_middleware';
import middleware from './middleware';

export const resolvers: ResolverMap = {
  Query: {
    currentUser: applyGQLMiddleware(middleware, async (_, __, { req }) => {
      try {
        const session = req.session;

        if (!session) throw new Error();
        const user = await User.findOne({
          where: { id: session.userId },
        });
        return user;
      } catch (e) {
        return [
          {
            path: 'session',
            message: 'Not authorized',
          },
        ];
      }
    }),
  },
  Mutation: {
    dummy3: () => 'ignore',
  },
};

// QueryBuilder
// https://typeorm.io/#/select-query-builder
