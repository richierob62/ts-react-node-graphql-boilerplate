import { Mutation, Resolver, Ctx } from 'type-graphql';
import { Context } from '../../utils/server/resolver_types';
import { removeUserSessions } from '../../utils/auth/remove_users_sessions';

@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: Context): Promise<boolean> {
    if (!ctx.req.session) return false;

    const { userId } = ctx.req.session;

    if (userId) {
      await removeUserSessions(parseInt(userId), ctx.redis, ctx.res);
      return true;
    }

    return false;
  }
}
