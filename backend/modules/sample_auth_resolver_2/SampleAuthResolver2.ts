import { Query, Resolver, UseMiddleware } from 'type-graphql';

import { isAuthenticated } from '../../middleware/is_authenticated';

@Resolver()
export class SampleAuthResolver2 {
  @UseMiddleware(isAuthenticated)
  @Query(() => String)
  async secretStuff2(): Promise<String> {
    return 'is logged in';
  }
}
