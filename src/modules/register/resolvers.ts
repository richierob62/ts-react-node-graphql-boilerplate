import { Profile } from '../../entity/Profile';
import { ResolverMap } from '../../utils/resolver_types';
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'ignore',
  },
  Mutation: {
    register: async (_, args) => {
      try {
        const userData = { ...args } as User;
        delete userData.profile;

        let profile;
        if (args.profile) {
          const profileData = args.profile as Profile;
          profile = Profile.create(profileData);
          await Profile.save(profile);
          userData.profileId = profile.id;
        }
        const user = User.create(userData);
        const result = await User.save(user);
        return result;
      } catch (e) {
        throw new Error(e.message);
      }
    },
  },
};

// QueryBuilder
// https://typeorm.io/#/select-query-builder
