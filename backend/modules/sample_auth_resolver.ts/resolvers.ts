import { Query, Resolver, UseMiddleware } from 'type-graphql';

import { isAuthenticated } from '../../middleware/is_authenticated';
import { isFooAtExample } from '../../middleware/is_foo_at_example';

@Resolver()
export class SampleAuthResolver {
  @UseMiddleware(isFooAtExample)
  @Query(() => String)
  async secretStuff(): Promise<String> {
    return 'authorized to do this';
  }
}

@Resolver()
export class SampleAuthResolver2 {
  @UseMiddleware(isAuthenticated)
  @Query(() => String)
  async secretStuff2(): Promise<String> {
    return 'is logged in';
  }
}
