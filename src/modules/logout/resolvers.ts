import { ResolverMap } from '../../utils/resolver_types';

export const resolvers: ResolverMap = {
  Query: {
    dummy4: () => 'ignore',
  },
  Mutation: {
    logout: async (_, __, { req }) => {
      const result = await new Promise((res) =>
        (req.session as any).destroy(() => res(true))
      );
      return result;
    },
  },
};

// QueryBuilder
// https://typeorm.io/#/select-query-builder
