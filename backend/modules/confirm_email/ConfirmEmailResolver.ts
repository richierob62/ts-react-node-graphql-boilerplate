import { Mutation, Resolver, Ctx, Arg } from 'type-graphql';
import { Context } from '../../utils/server/resolver_types';
import { AuthenticationError } from 'apollo-server-express';
import { User } from '../../entity/User';

@Resolver()
export class ConfirmEmailResolver {
  @Mutation(() => Boolean)
  async confirmEmail(
    @Arg('token') token: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const userId = await ctx.redis.get(token);
    if (!userId) throw new AuthenticationError('invalid or expired token');

    try {
      await User.update({ id: parseInt(userId) }, { confirmed: true });
      await ctx.redis.del(token);
    } catch (e) {
      throw new AuthenticationError('invalid or expired token');
    }

    return true;
  }
}
