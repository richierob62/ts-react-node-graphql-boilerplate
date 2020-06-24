import {
  ClassType,
  Resolver,
  UseMiddleware,
  Mutation,
  Arg,
  Ctx,
} from 'type-graphql';
import { Middleware } from 'type-graphql/dist/interfaces/Middleware';
import { Context } from '../utils/server/resolver_types';

export const CreateCrudResolverBase = <
  T extends ClassType,
  U extends ClassType
>(
  inputType: T,
  returnType: U,
  entity: any,
  suffix: string,
  middleware?: Middleware<any>[]
) => {
  @Resolver()
  class CrudResolver {
    @Mutation(() => returnType, { name: `create${suffix}` })
    @UseMiddleware(...(middleware || []))
    async create(
      @Arg('data', () => inputType) data: T,
      @Ctx() ctx: Context
    ): Promise<Partial<V>> {
      console.log(ctx ? '' : ''); // bc ctx not used in function
      const item = await entity.create(data).save();
      return item;
    }
  }

  return CrudResolver;
};
