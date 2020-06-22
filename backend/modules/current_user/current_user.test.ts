import {
  currentUserQuery,
  loginMutation,
  registerMutation,
} from '../../graphql/queries';

import { Connection } from 'typeorm';
import { LoginInput } from '../login/login_input';
import { RegisterInput } from '../register/RegisterInput';
import { User } from '../../entity/User';
import faker from 'faker';
import gqlCall from '../../utils/tests/gql_call';
import { testConn } from '../../utils/tests/testConn';

let conn: Connection;

beforeEach(async () => {
  conn = await testConn(true);
});

afterEach(async () => {
  await conn.close();
});

describe('current user', () => {
  it('returns null if no cookie', async () => {
    const user: RegisterInput = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };
    await gqlCall({
      source: registerMutation,
      variableValues: { data: user },
    });
    await User.update({ email: user.email }, { confirmed: true });
    const result = await gqlCall({
      source: currentUserQuery,
    });
    expect(result!.data!.currentUser).toEqual(null);
  });

  it('returns current user', async () => {
    const user: RegisterInput = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    await gqlCall({
      source: registerMutation,
      variableValues: { data: user },
    });

    await User.update({ email: user.email }, { confirmed: true });

    const loginData: LoginInput = {
      email: user.email,
      password: user.password,
    };

    await gqlCall({
      source: loginMutation,
      variableValues: { loginData },
    });

    const current = await gqlCall({
      source: currentUserQuery,
      userId: 1,
    });

    expect(current).toMatchObject({
      data: {
        currentUser: {
          id: '1',
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });
  });
});
