import { ResolverMap } from '../../utils/resolver_types';

export const resolvers: ResolverMap = {
  Query: {
    dummy4: () => 'ignore',
  },
  Mutation: {
    logout: async (_, __, { req, redis }) => {
      if (!req.session) return false;

      const { userId } = req.session;

      if (userId) {
        const sessionIds = await redis.lrange(`user_sid:${userId}`, 0, -1);

        const promises = [];

        for (let i = 0; i < sessionIds.length; i++) {
          promises.push(redis.del(`sess:${sessionIds[i]}`));
        }

        await Promise.all(promises);

        return true;
      }

      return false;
    },
  },
};

// QueryBuilder
// https://typeorm.io/#/select-query-builder
