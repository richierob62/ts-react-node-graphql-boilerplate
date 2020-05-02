import * as bcrypt from 'bcrypt';

import { ResolverMap } from '../../utils/resolver_types';
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
  Query: {
    dummy2: () => 'ignore',
  },
  Mutation: {
    login: async (_, { email, password }, { req }) => {
      try {
        const user = await User.findOne({ where: { email } });

        if (!user) throw new Error();

        if (!user.confirmed)
          return [
            {
              path: 'email',
              message: 'Please confirm your email address (see email sent)',
            },
          ];

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) throw new Error();

        (req.session as any).userId = user.id;

        return null;
      } catch (e) {
        return [
          {
            path: 'email',
            message: 'Invalid credentials',
          },
        ];
      }
    },
  },
};

// QueryBuilder
// https://typeorm.io/#/select-query-builder
