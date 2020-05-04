import { ResolverMap } from '../../utils/resolver_types';
import { removeUserSessions } from '../../utils/remove_users_sessions';

export const resolvers: ResolverMap = {
  Query: {
    dummy4: () => 'ignore',
  },
  Mutation: {
    logout: async (_, __, { req, redis }) => {
      if (!req.session) return false;

      const { userId } = req.session;

      if (userId) {
        removeUserSessions(parseInt(userId), redis);
        return true;
      }

      return false;
    },
  },
};

// QueryBuilder
// https://typeorm.io/#/select-query-builder
