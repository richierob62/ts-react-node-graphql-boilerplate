import { Profile } from '../entity/Profile';
import { ResolverMap } from './resolver_types';
import { User } from '../entity/User';

const resolvers: ResolverMap = {
  Query: {
    user: async (_, { id }) => {
      const user = await User.findOne({
        where: {
          id,
        },
        relations: ['profile', 'photos'],
      });
      console.log(user);
      return user;
    },
    users: async () => await User.find({ relations: ['profile'] }),
  },
  Mutation: {
    createUser: async (_, args) => {
      try {
        const userData = { ...args } as User;
        delete userData.profile;

        let profile;
        if (args.profile) {
          const profileData = args.profile as Profile;
          profile = await Profile.create(profileData);
          await Profile.save(profile);
          userData.profileId = profile.id;
        }
        const user = await User.create(userData);
        const result = await User.save(user);
        return result;
      } catch (e) {
        throw new Error(e.message);
      }
    },
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

export default resolvers;

// QueryBuilder
// https://typeorm.io/#/select-query-builder
