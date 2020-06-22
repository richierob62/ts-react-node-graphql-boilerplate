import { loginMutation, registerMutation } from '../../graphql/queries';

import { Connection } from 'typeorm';
import { LoginInput } from './login_input';
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

describe('login', () => {
  it('can login user', async () => {
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

    const result = await gqlCall({
      source: loginMutation,
      variableValues: { data: loginData },
    });

    const { email, firstName, lastName } = user;

    expect(result).toMatchObject({
      data: {
        login: {
          email,
          firstName,
          lastName,
        },
      },
    });
  });

  it('can returns error for bad creds', async () => {
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
      email: 'bad_email@email.com',
      password: user.password,
    };

    const result = await gqlCall({
      source: loginMutation,
      variableValues: { data: loginData },
    });

    expect(result!.errors![0]).toBeDefined();

    const loginData_2: LoginInput = {
      email: user.email,
      password: 'bad password',
    };

    const result_2 = await gqlCall({
      source: loginMutation,
      variableValues: { data: loginData_2 },
    });

    expect(result_2!.errors![0]).toBeDefined();
  });
});
