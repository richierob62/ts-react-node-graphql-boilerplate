import { Connection } from 'typeorm';
import { Strategy } from 'passport-twitter';
import { User } from '../../entity/User';

const strategy = (connection: Connection) =>
  new Strategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
      callbackURL: 'http://localhost:3001/auth/twitter/callback',
      includeEmail: true,
    },
    async (_, __, profile, cb) => {
      const { id, emails } = profile;
      const email = emails ? emails[0].value : null;

      const query = connection
        .getRepository(User)
        .createQueryBuilder('user')
        .where('user.twitter_id = :id', { id });

      if (email) {
        query.orWhere('user.email = :email', { email });
      }

      let user = await query.getOne();

      if (!user) {
        user = await User.create({
          twitter_id: id,
          email,
        }).save();
      } else if (!user.twitter_id) {
        user.twitter_id = id;
        user.save();
      }

      return cb(null, { id: user.id });
    }
  );

export default strategy;
