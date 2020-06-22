import { User } from '../../entity/User';
import bcrypt from 'bcrypt';
import { LoginInput } from './login_input';
import { Mutation, Resolver, Arg, Ctx } from 'type-graphql';
import { Context } from '../../utils/server/resolver_types';

@Resolver()
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg('data') data: LoginInput,
    @Ctx() ctx: Context
  ): Promise<User | undefined> {
    const user = await User.findOne({ where: { email: data.email } });

    if (!user) throw new Error('Invalid credentials');

    if (!user.confirmed)
      throw new Error('Please confirm your email address (see email sent)');

    if (user.account_locked) throw new Error('Your account has been locked');

    if (!user.password) {
      // user logged in using oauth
      throw new Error(
        'Invalid credentials.  Try again or use social media login'
      );
    }

    const validPassword = await bcrypt.compare(data.password, user.password);

    if (!validPassword) throw new Error('Invalid credentials');

    const { req, redis } = ctx;

    req.session!.userId = user.id;

    if (req.sessionID) {
      await redis.lpush(`user_sid:${user.id}`, req.sessionID);
    }

    return user;
  }
}
