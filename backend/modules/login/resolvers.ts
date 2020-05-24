import { ResolverMap } from '../../utils/server/resolver_types';
import { User } from '../../entity/User';
import bcrypt from 'bcrypt';

export const resolvers: ResolverMap = {
  Query: {
    dummy2: () => 'ignore',
  },
  Mutation: {
    login: async (_, { email, password }, { req, redis }) => {
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

        if (user.account_locked)
          return [
            {
              path: 'email',
              message: 'Your account has been locked',
            },
          ];

        if (!user.password) {
          // user logged in using oauth
          return [
            {
              path: 'email',
              message: 'Invalid credentials',
            },
          ];
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) throw new Error();

        (req.session as any).userId = user.id;
        if (req.sessionID) {
          await redis.lpush(`user_sid:${user.id}`, req.sessionID);
        }

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
