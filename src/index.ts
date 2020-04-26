import 'dotenv/config';
import 'reflect-metadata';

import * as express from 'express';

import { ApolloServer } from 'apollo-server-express';
import { createConnection } from 'typeorm';
import { importSchema } from 'graphql-import';
import resolvers from './graphql/resolvers';

const typeDefs = importSchema('src/graphql/typedefs.graphql');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

server.applyMiddleware({ app });

createConnection().then(() => {
  app.listen({ port: process.env.PORT }, () => {
    console.log(`Server ready at http://localhost:${process.env.PORT}`);
  });
});
