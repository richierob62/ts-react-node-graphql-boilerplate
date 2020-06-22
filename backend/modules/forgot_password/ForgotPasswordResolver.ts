import { Mutation, Resolver, Arg, Ctx } from 'type-graphql';
import { User } from '../../entity/User';
// import { sendEmail, EmailData } from '../../utils/mail/send_email';
// import { createConfirmEmailLink } from '../../utils/auth/create_confirm_email_link';
import { Context } from '../../utils/server/resolver_types';
import { removeUserSessions } from '../../utils/auth/remove_users_sessions';
import { createForgotPasswordEmailLink } from '../../utils/auth/create_forgot_password_email_link';
import { EmailInput } from '../register/EmailInput';

@Resolver()
export class ForgotPasswordResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('data') data: EmailInput,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) return false;

    await User.update({ id: user.id }, { account_locked: true });
    await removeUserSessions(user.id, ctx.redis, ctx.res);

    await createForgotPasswordEmailLink(
      process.env.FRONT_END_DOMAIN as string,
      user.id,
      ctx.redis
    );

    // TODO: send email

    return true;
  }
}
