import { ApolloServer } from 'apollo-server-express';
import { Connection } from 'typeorm';
import RateLimitRedisStore from 'rate-limit-redis';
import { confirmEmail } from '../../routes/confirmEmail';
import connectRedis from 'connect-redis';
import cors from 'cors';
import createSchema from './create_schema';
import createTypeormConnection from './create_typeorm_connection';
import express from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
// import generateSchema from './generate_schema';
import redis from '../redis/redis';
import session from 'express-session';
import twitterStrategy from '../auth/twitter_oauth';

const startServer = async (port: string) => {
  // const schema = generateSchema();
  const schema = await createSchema();
  const app = express();

  // request body creation
  // -----------------------------------------------------------------------
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // session
  // -----------------------------------------------------------------------
  const SessionRedisStore = connectRedis(session);

  app.use(
    session({
      name: process.env.SESSION_NAME,
      secret: process.env.SESSION_SECRET!,
      store: new SessionRedisStore({ client: redis, prefix: 'sess:' }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  // cors
  // -----------------------------------------------------------------------
  const corsOptions = {
    credentials: true,
    origin: process.env.TESTING ? '*' : process.env.FRONT_END_DOMAIN,
  };

  app.set('trust proxy', true);

  app.use(cors(corsOptions));

  // rate limiting
  // -----------------------------------------------------------------------
  app.use(
    rateLimit({
      store: new RateLimitRedisStore({
        client: redis,
      }),
      windowMs: 15 * 60 * 1000,
      max: 100,
    })
  );

  // non-graphql endpoints
  // -----------------------------------------------------------------------
  app.get('/confirm/:id', confirmEmail);

  app.get('/auth/twitter', passport.authenticate('twitter'));

  app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', { session: false }),
    (req, res) => {
      (req.session as any).userId = (req.user as any).id;
      res.redirect(`${process.env.FRONT_END_DOMAIN}/`);
    }
  );

  // graphql server
  // -----------------------------------------------------------------------
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      confirmUrl: req.protocol + '://' + req.get('host'),
    }),
  });

  server.applyMiddleware({ app });
  const connection: Connection = await createTypeormConnection();

  // passport oauth
  passport.use(twitterStrategy(connection));
  app.use(passport.initialize());

  // server
  app.listen({ port }, () =>
    console.log(`Server ready at http://localhost:${port}`)
  );
};

export default startServer;
