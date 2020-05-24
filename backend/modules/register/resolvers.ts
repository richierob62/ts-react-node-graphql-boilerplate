import {
  Mutation,
  // Query,
  Resolver,
  Arg,
  FieldResolver,
  Root,
} from 'type-graphql';
import { User } from '../../entity/User';

// import { Profile } from '../../entity/Profile';
// import { ResolverMap } from '../../utils/server/resolver_types';
// import { User } from '../../entity/User';
// import { createConfirmEmailLink } from '../../utils/auth/create_confirm_email_link';
// import { emailAndPasswordValidation } from '../../utils/validation/yup_schemas';
// import { formatYupError } from '../../utils/validation/format_yup_error';

// export const resolvers: ResolverMap = {
//   Query: {
//     dummy: () => 'ignore',
//   },
//   Mutation: {
//     register: async (_, args, { redis, confirmUrl }) => {
//       try {
//         try {
//           await emailAndPasswordValidation.validate(args, {
//             abortEarly: false,
//           });
//         } catch (e) {
//           return formatYupError(e);
//         }

//         // const { email, passord } = args;
//         const userData = { ...args } as User;
//         delete userData.profile;

//         let profile;
//         if (args.profile) {
//           const profileData = args.profile as Profile;
//           profile = Profile.create(profileData);
//           await Profile.save(profile);
//           userData.profileId = profile.id;
//         }

//         await createConfirmEmailLink(confirmUrl, user.id, redis);

//         return null;
//       } catch (e) {

//       }
//     },
//   },
// };

@Resolver(User)
export class RegisterResolver {
  // @Query(() => Number)
  // dummy() {
  //   return `dummy query`;
  // }

  @FieldResolver(() => String)
  fullName(@Root() usr: User) {
    return `${usr.firstName} ${usr.lastName}`;
  }

  @Mutation(() => User)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<User | any[]> {
    try {
      const userWithEmail = await User.findOne({
        where: { email },
        select: ['id'],
      });

      if (userWithEmail) {
        throw new Error();
      }

      const user = User.create({ email, password });
      await user.save();

      return user;
    } catch (e) {
      return [
        {
          path: 'email',
          message: 'email already registered',
        },
      ];
    }
  }
}

// QueryBuilder
// https://typeorm.io/#/select-query-builder
