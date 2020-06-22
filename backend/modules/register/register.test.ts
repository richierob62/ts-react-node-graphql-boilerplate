import { Connection } from 'typeorm';
import { RegisterInput } from './RegisterInput';
import { User } from '../../entity/User';
import faker from 'faker';
import gqlCall from '../../utils/tests/gql_call';
import { registerMutation } from '../../graphql/queries';
import { testConn } from '../../utils/tests/testConn';

let conn: Connection;

beforeEach(async () => {
  conn = await testConn(true);
});

afterEach(async () => {
  await conn.close();
});

describe('register', () => {
  it('can register user', async () => {
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

    expect(result).toMatchObject({
      data: {
        register: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    });

    const user = await User.findOne({ email: data.email });
    expect(user).toMatchObject({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      confirmed: false,
    });
  });

  it('returns error for duplicate email', async () => {
    const data: RegisterInput = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    await gqlCall({
      source: registerMutation,
      variableValues: { data },
    });

    const result = await gqlCall({
      source: registerMutation,
      variableValues: { data },
    });

    expect(result.data).toBeNull();
    expect(result!.errors!.length).toBe(1);
  });

  it('checks for valid email', async () => {
    const data: RegisterInput = {
      email: 'foo',
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const result = await gqlCall({
      source: registerMutation,
      variableValues: { data },
    });

    expect(result!.errors!.length).toBe(1);
  });

  it('checks for valid password', async () => {
    const data: RegisterInput = {
      email: faker.internet.email(),
      password: '123',
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const result = await gqlCall({
      source: registerMutation,
      variableValues: { data },
    });

    expect(result!.errors!.length).toBe(1);
  });
});
