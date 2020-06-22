import { Mutation, Resolver, Arg, Ctx } from 'type-graphql';
import { User } from '../../entity/User';
import { RegisterInput } from './RegisterInput';
import { sendEmail, EmailData } from '../../utils/mail/send_email';
import { createConfirmEmailLink } from '../../utils/auth/create_confirm_email_link';
import { Context } from '../../utils/server/resolver_types';

@Resolver()
export class RegisterResolver {
  @Mutation(() => User)
  async register(
    @Arg('data') data: RegisterInput,
    @Ctx() ctx: Context
  ): Promise<Partial<User>> {
    const user = User.create(data);

    await user.save();

    // TODO remove this check - added to restrict during testing
    if (data.email === 'send@example.com') {
      const link = await createConfirmEmailLink(
        ctx.confirmUrl,
        user.id,
        ctx.redis
      );

      const mailData: EmailData = {
        from: '"Mr. From" <from@example.com>',
        to: `"Ms. To" <${data.email}>'`,
        subject: 'Confirmation Email',
        text: `please confirm your email by visiting ${link}`,
        html: `please confirm your email by visiting <a href="${link}">${link}</a>`,
      };

      await sendEmail(mailData);
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
