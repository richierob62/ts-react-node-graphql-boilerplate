import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';

import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import createTypeormConnection from './create_typeorm_connection';
import { importSchema } from 'graphql-import';

const startServer = async (port: string) => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs
    .readdirSync(path.join(__dirname, '../modules'))
    .filter((name) => name.indexOf('.') === -1);

  folders.forEach((folder) => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `../modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const server = new ApolloServer({
    schema: mergeSchemas({ schemas }),
    context: ({ req, res }) => ({ req, res }),
  });

  server.applyMiddleware({ app });
  await createTypeormConnection();
  await app.listen({ port });
  await console.log(`Server ready at http://localhost:${port}`);
};

export default startServer;
