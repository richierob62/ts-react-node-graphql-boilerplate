import { Connection } from 'typeorm';
import { Strategy } from 'passport-facebook';
import { User } from '../../entity/User';

const strategy = (connection: Connection) =>
  new Strategy(
    {
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      callbackURL: 'http://localhost:3001/auth/facebook/callback',
      profileFields: ['email', 'name'],
    },
    async (_, __, profile, cb) => {
      const { id, emails, name } = profile;
      const email = emails ? emails[0].value : null;
      const firstName = name ? name.givenName : null;
      const lastName = name ? name.familyName : null;

      const query = connection
        .getRepository(User)
        .createQueryBuilder('user')
        .where('user.facebook_id = :id', { id });

      if (email) {
        query.orWhere('user.email = :email', { email });
      }

      let user = await query.getOne();

      if (!user) {
        user = await User.create({
          facebook_id: id,
          email,
          firstName,
          lastName,
          confirmed: true,
        }).save();
      } else {
        user.facebook_id = id;
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.confirmed = true;

        await user.save();
      }

      return cb(null, { id: user.id });
    }
  );

export default strategy;
