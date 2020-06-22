import {
  forgotPasswordMutation,
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

describe('forgot password', () => {
  it('rejects a bad password', async () => {
    const data: RegisterInput = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const result = await gqlCall({
      source: registerMutation,
      variableValues: { data },
    });

    const id = result!.data!.register!.id;

    await User.update({ id }, { confirmed: true });

    const locked = await gqlCall({
      source: forgotPasswordMutation,
      variableValues: { data: { email: data.email } },
    });

    expect(locked).toMatchObject({
      data: {
        forgotPassword: true,
      },
    });

    const user = await User.findOne({
      where: { account_locked: true, email: data.email },
    });

    expect(user).toBeDefined();

    const loginData: LoginInput = {
      email: user!.email!,
      password: user!.password!,
    };

    const loginResult = await gqlCall({
      source: loginMutation,
      variableValues: { data: loginData },
    });

    expect(loginResult.errors).toBeDefined();
    expect(loginResult.data!.login).toBeFalsy();
  });
});
