import { Query, Resolver, buildSchema } from 'type-graphql';

@Resolver()
class TestResolver {
  @Query(() => String)
  async hello() {
    return `Hello at ${new Date().toISOString()}`;
  }
}

const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [TestResolver],
  });

  return schema;
};

export default createSchema;
