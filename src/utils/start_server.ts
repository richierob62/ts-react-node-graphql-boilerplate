import * as Redis from 'ioredis';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';

import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import { User } from '../entity/User';
import createTypeormConnection from './create_typeorm_connection';
import { importSchema } from 'graphql-import';

const startServer = async (port: string) => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs
    .readdirSync(path.join(__dirname, '../modules'))
    .filter((name) => name.indexOf('.') === -1);

  folders.forEach((folder) => {
    if (folder !== 'shared') {
      const { resolvers } = require(`../modules/${folder}/resolvers`);
      const typeDefs = importSchema(
        path.join(__dirname, `../modules/${folder}/schema.graphql`)
      );
      schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
    }
  });

  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const redis = new Redis();

  app.get('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (!userId) return res.send('invalid');
    await User.update({ id: parseInt(userId) }, { confirmed: true });
    await redis.del(id);
    return res.send('ok'); // or redirect
  });

  const server = new ApolloServer({
    schema: mergeSchemas({ schemas }),
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
