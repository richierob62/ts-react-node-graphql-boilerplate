import { Profile } from '../../entity/Profile';
import { ResolverMap } from '../../utils/server/resolver_types';
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
  Query: {
    user: async (_, { id }) => {
      const user = await User.findOne({
        where: {
          id,
        },
        relations: ['profile', 'photos'],
      });
      return user;
    },
    users: async () => await User.find({ relations: ['profile'] }),
  },
  Mutation: {
    updateUser: async (_, { id, ...args }) => {
      try {
        const user = await User.findOne({
          where: {
            id,
          },
        });
        if (user) {
          User.merge(user, args);
          await User.save(user);
          return true;
        } else {
          throw new Error('Error updating user');
        }
      } catch (err) {
        return false;
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        const user = await User.findOne({
          where: {
            id,
          },
        });
        // handle one-to-one cascade programatically
        if (user && user.profileId) {
          await Profile.delete(user.profileId);
        }
        await User.delete(id);
        return true;
      } catch (e) {
        throw new Error(e.message);
      }
    },
  },
};

// QueryBuilder
// https://typeorm.io/#/select-query-builder
