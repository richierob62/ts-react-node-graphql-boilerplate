import { GraphQLSchema, graphql } from 'graphql';

import Maybe from 'graphql/tsutils/Maybe';
import createSchema from '../server/create_schema';

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
}

let schema: GraphQLSchema;

const gqlCall = async ({ source, variableValues }: Options) => {
  if (!schema) {
    schema = await createSchema();
  }

  return graphql({
    schema,
    source,
    variableValues,
  });
};

export default gqlCall;
