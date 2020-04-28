import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import createTypeormConnection from '../../utils/create_typeorm_connection';
import { request } from 'graphql-request';

const graphql_endpoint = 'http://localhost:3001/graphql';
let conn: Connection;

const mutation = (email: string, password: string) => `mutation {
  register(firstName: "first name", lastName: "last name", password: "${password}", email: "${email}", profile: {
    favoriteColor: "green"
  }) {
    path
    message
  }
}`;

beforeEach(async () => {
  conn = await createTypeormConnection();
});

afterEach(async () => {
  await conn.close();
});

describe('Register', () => {
  test('Can register user', async () => {
    const email = `first@example.com`;
    const pw = 'password';

    const mutate = mutation(email, pw);

    const expected = {
      register: null,
    };

    const response = await request(graphql_endpoint, mutate);

    expect(response).toEqual(expected);

    const users = await User.find({ email });
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
    expect(users[0].password).not.toEqual(pw);
  });

  test('Returns error for duplicate email', async () => {
    const email = `first@example.com`;
    const pw = 'password';

    const mutate = mutation(email, pw);

    await request(graphql_endpoint, mutate);

    const response = await request(graphql_endpoint, mutate);

    const expected = JSON.stringify({
      register: [{ path: 'email', message: 'email already registered' }],
    });

    expect(JSON.stringify(response)).toEqual(expected);
  });

  test('Checks valid email and password', async () => {
    const email = `aa`;
    const pw = 'aa';

    const mutate = mutation(email, pw);

    const { register } = await request(graphql_endpoint, mutate);

    expect(register.length).toBe(3);

    const stringifyResponse = JSON.stringify(register);

    expect(stringifyResponse).toContain(
      JSON.stringify({
        path: 'email',
        message: 'email must be at least 3 characters',
      })
    );

    expect(stringifyResponse).toContain(
      JSON.stringify({ path: 'email', message: 'email must be a valid email' })
    );

    expect(stringifyResponse).toContain(
      JSON.stringify({
        path: 'password',
        message: 'password must be at least 3 characters',
      })
    );
  });
});
