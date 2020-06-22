import { Query, Resolver, UseMiddleware } from 'type-graphql';

import { isSendAtExample } from '../../middleware/is_send_at_example';

@Resolver()
export class SampleAuthResolver {
  @UseMiddleware(isSendAtExample)
  @Query(() => String)
  async secretStuff(): Promise<String> {
    return 'authorized to do this';
  }
}
