import { Connection } from 'typeorm';
import { Strategy } from 'passport-instagram';
import { User } from '../../entity/User';

const strategy = (connection: Connection) =>
  new Strategy(
    {
      clientID: process.env.INSTAGRAM_CLIENT_ID as string,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET as string,
      callbackURL: 'https://localhost:3001/auth/instagram/callback',
    },
    async (_, __, profile, cb) => {
      console.log(profile);

      const { id, emails, name } = profile;
      const email = emails ? emails[0].value : null;
      const firstName = name ? name.givenName : null;
      const lastName = name ? name.familyName : null;

      const query = connection
        .getRepository(User)
        .createQueryBuilder('user')
        .where('user.instagram_id = :id', { id });

      if (email) {
        query.orWhere('user.email = :email', { email });
      }

      let user = await query.getOne();

      if (!user) {
        user = await User.create({
          instagram_id: id,
          email,
          firstName,
          lastName,
          confirmed: true,
        }).save();
      } else {
        user.instagram_id = id;
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
