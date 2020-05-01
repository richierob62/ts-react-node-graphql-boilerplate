import * as yup from 'yup';

import { Profile } from '../../entity/Profile';
import { ResolverMap } from '../../utils/resolver_types';
import { User } from '../../entity/User';
import { createConfirmEmailLink } from '../../utils/create_confirm_email_link';
import { formatYupError } from '../../utils/format_yup_error';

const schema = yup.object().shape({
  email: yup.string().min(3).max(100).email(),
  password: yup.string().min(3).max(100),
});

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'ignore',
  },
  Mutation: {
    register: async (_, args, { redis, confirmUrl }) => {
      try {
        try {
          await schema.validate(args, { abortEarly: false });
        } catch (e) {
          return formatYupError(e);
        }

        // const { email, passord } = args;
        const userData = { ...args } as User;
        delete userData.profile;
        const userWithEmail = await User.findOne({
          where: { email: userData.email },
          select: ['id'],
        });

        if (userWithEmail) {
          throw new Error();
        }

        let profile;
        if (args.profile) {
          const profileData = args.profile as Profile;
          profile = Profile.create(profileData);
          await Profile.save(profile);
          userData.profileId = profile.id;
        }
        const user = User.create(userData);
        await user.save();

        await createConfirmEmailLink(confirmUrl, user.id, redis);

        return null;
      } catch (e) {
        return [
          {
            path: 'email',
            message: 'email already registered',
          },
        ];
      }
    },
  },
};

// QueryBuilder
// https://typeorm.io/#/select-query-builder
