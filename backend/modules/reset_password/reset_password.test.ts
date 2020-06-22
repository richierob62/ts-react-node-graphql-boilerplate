import {
  loginMutation,
  registerMutation,
  resetPasswordMutation,
} from '../../graphql/queries';

import { Connection } from 'typeorm';
import { LoginInput } from '../login/login_input';
import { PasswordResetInput } from './PasswordResetInput';
import { RegisterInput } from '../register/RegisterInput';
import { User } from '../../entity/User';
import { createForgotPasswordEmailLink } from '../../utils/auth/create_forgot_password_email_link';
import faker from 'faker';
import gqlCall from '../../utils/tests/gql_call';
import redis from '../../utils/redis/redis';
import { testConn } from '../../utils/tests/testConn';

let conn: Connection;

beforeEach(async () => {
  conn = await testConn(true);
});

afterEach(async () => {
  await conn.close();
});

describe('reset password', () => {
  it('can reset the password', async () => {
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

    await User.update({ id }, { confirmed: true, account_locked: true });

    // can't log in
    const data_1: LoginInput = {
      email: data.email,
      password: data.password,
    };

    const disabledResult = await gqlCall({
      source: loginMutation,
      variableValues: { data: data_1 },
    });

    expect(disabledResult.errors).toBeDefined();

    const url = await createForgotPasswordEmailLink('something', id, redis);

    const data_2: PasswordResetInput = {
      key: url.split('/')[2],
      password: 'foo',
    };

    const result_2 = await gqlCall({
      source: resetPasswordMutation,
      variableValues: { data: data_2 },
    });

    expect(result_2.errors).toBeDefined();

    data_2.password = 'goodpassword';

    const result_3 = await gqlCall({
      source: resetPasswordMutation,
      variableValues: { data: data_2 },
    });

    expect(result_3.data!.resetPassword).toBeTruthy();

    const loginData: LoginInput = {
      email: data.email,
      password: data_2.password,
    };

    const loginResult = await gqlCall({
      source: loginMutation,
      variableValues: { data: loginData },
    });

    expect(loginResult).toMatchObject({
      data: {
        login: {
          email: data.email,
        },
      },
    });
  });
});
