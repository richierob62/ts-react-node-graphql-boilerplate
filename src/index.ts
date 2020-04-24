import 'dotenv/config';

import * as express from 'express';

import { ApolloServer } from 'apollo-server-express';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_: any, { name }: any) => `hhello ${name || 'World'}`,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

server.applyMiddleware({ app });

app.listen({ port: process.env.PORT }, () => {
  console.log(`Server ready at http://localhost:${process.env.PORT}`);
});
