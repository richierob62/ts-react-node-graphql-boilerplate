import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';

import { GraphQLSchema } from 'graphql';
import fs from 'fs';
import { importSchema } from 'graphql-import';
import path from 'path';

const generateSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs
    .readdirSync(path.join(__dirname, '../../modules'))
    .filter((name) => name.indexOf('.') === -1);

  folders.forEach((folder) => {
    if (folder !== 'shared') {
      const { resolvers } = require(`../../modules/${folder}/resolvers`);
      const typeDefs = importSchema(
        path.join(__dirname, `../../modules/${folder}/schema.graphql`)
      );
      schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
    }
  });

  return mergeSchemas({ schemas });
};

export default generateSchema;
