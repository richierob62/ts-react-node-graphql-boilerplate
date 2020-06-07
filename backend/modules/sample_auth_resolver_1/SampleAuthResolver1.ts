import { Query, Resolver, UseMiddleware } from 'type-graphql';

import { isFooAtExample } from '../../middleware/is_foo_at_example';

@Resolver()
export class SampleAuthResolver {
  @UseMiddleware(isFooAtExample)
  @Query(() => String)
  async secretStuff(): Promise<String> {
    return 'authorized to do this';
  }
}
