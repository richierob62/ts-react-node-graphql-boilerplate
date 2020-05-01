import * as express from 'express';

import { ApolloServer } from 'apollo-server-express';
import { confirmEmail } from '../routes/confirmEmail';
import createTypeormConnection from './create_typeorm_connection';
import generateSchema from './generate_schema';
import redis from './redis';

import session = require('express-session');

const startServer = async (port: string) => {
  const schema = generateSchema();
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    session({
      name: 'qid',
      secret: process.env.SESSION_SECRET || 'session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.get('/confirm/:id', confirmEmail);

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
  await createTypeormConnection();
  await app.listen({ port });
  await console.log(`Server ready at http://localhost:${port}`);
};

export default startServer;
