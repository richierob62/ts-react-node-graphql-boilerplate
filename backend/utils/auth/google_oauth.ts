import { Connection } from 'typeorm';
import GoogleStrategy from 'passport-google-oauth';
import { User } from '../../entity/User';

const Strategy = GoogleStrategy.OAuth2Strategy;

const strategy = (connection: Connection) =>
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: 'http://localhost:3001/auth/google/callback',
    },
    async (_, __, profile, cb) => {
      const { id, emails, name } = profile;
      const email = emails ? emails[0].value : null;
      const firstName = name ? name.givenName : null;
      const lastName = name ? name.familyName : null;

      const query = connection
        .getRepository(User)
        .createQueryBuilder('user')
        .where('user.google_id = :id', { id });

      if (email) {
        query.orWhere('user.email = :email', { email });
      }

      let user = await query.getOne();

      if (!user) {
        user = await User.create({
          google_id: id,
          email,
          firstName,
          lastName,
          confirmed: true,
        }).save();
      } else {
        user.google_id = id;
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
