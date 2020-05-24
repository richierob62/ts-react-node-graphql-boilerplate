// import fs from 'fs';
// import path from 'path';

import { CurrentUserResolver } from '../../modules/current_user/resolvers';
import { RegisterResolver } from '../../modules/register/resolvers';
import { buildSchema } from 'type-graphql';

const createSchema = async () => {
  // const resolvers: [] = [];
  // const folders = fs
  //   .readdirSync(path.join(__dirname, '../../modules'))
  //   .filter((name) => name.indexOf('.') === -1);
  // folders.forEach((folder) => {
  //   if (folder !== 'shared') {
  //     const { resolvers: res } = require(`../../modules/${folder}/resolvers`);
  //     resolvers.push(res);
  // const typeDefs = importSchema(
  //   path.join(__dirname, `../../modules/${folder}/schema.graphql`)
  // );
  //     // schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  //   }
  // });
  // if (resolvers.length === 0) throw new Error();
  // return schema;
  const schema = await buildSchema({
    resolvers: [CurrentUserResolver, RegisterResolver],
  });

  return schema;
};

export default createSchema;