import { Connection } from 'typeorm';
// import { RegisterInput } from './register_input';
import { TestClient } from '../../utils/tests/TestClient';
import { User } from '../../entity/User';
import { buildErrorObject } from '../../utils/auth/build_error_object';
// import { User } from '../../entity/User';
// import { createConfirmEmailLink } from '../../utils/auth/create_confirm_email_link';
import createTypeormConnection from '../../utils/server/create_typeorm_connection';
// import faker from 'faker';

// import Redis = require('ioredis');

// const domain = 'http://localhost:3001';

let conn: Connection;
let client: TestClient;
// const redis = new Redis();

beforeAll(() => {
  client = new TestClient();
});

beforeEach(async () => {
  conn = await createTypeormConnection();
});

afterEach(async () => {
  await conn.close();
});

describe('register', () => {
  it('can register user', async () => {
    const data: any = {
      email: 'foo@example.com',
      password: '123456',
      firstName: '',
      lastName: '',
    };

    const { email } = data;
    const result = await client.register(data);

    expect(result.data.register.email).toEqual(email);
    const users = await User.find({ email });
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
  });

  it('returns error for duplicate email', async () => {
    const data: any = {
      email: 'foo@example.com',
      password: '123456',
      firstName: '',
      lastName: '',
    };

    await client.register(data);

    const result = await client.register(data);

    const errors = buildErrorObject(result);

    const matchingErrors = errors.filter(
      (e: any) =>
        e.messages.indexOf('That email is already registered') !== -1 &&
        e.property === 'email'
    );

    expect(matchingErrors.length).toEqual(1);
  });

  // it('checks for valid email and password', async () => {
  //   const client = new TestClient(graphql_endpoint);

  //   const data: RegisterInput = {
  //     email: 'ee',
  //     password: 'pp',
  //     firstName: 'first',
  //     lastName: 'last',
  //   };
  //   const result = await client.register(data);

  //   expect(result.data.register.length).toBe(3);

  //   const stringifyResponse = JSON.stringify(result);

  //   expect(stringifyResponse).toContain(
  //     JSON.stringify({
  //       path: 'email',
  //       message: 'email must be at least 3 characters',
  //     })
  //   );

  //   expect(stringifyResponse).toContain(
  //     JSON.stringify({ path: 'email', message: 'email must be a valid email' })
  //   );

  //   expect(stringifyResponse).toContain(
  //     JSON.stringify({
  //       path: 'password',
  //       message: 'password must be at least 3 characters',
  //     })
  //   );
  // });

  // it('sends confirmation email', async () => {
  //   const client = new TestClient(graphql_endpoint);

  //   const data: RegisterInput = {
  //     email: faker.internet.email(),
  //     password: faker.internet.password(),
  //     firstName: 'first',
  //     lastName: 'last',
  //   };

  //   await client.register(data);

  //   const users = await User.find({ email: data.email });
  //   const { id } = users[0];

  //   const url = await createConfirmEmailLink(domain, id, redis);

  //   const response = await fetch(url);
  //   const text = await response.text();

  //   expect(text).toContain('<!DOCTYPE html>');

  //   const user = await User.findOne({ id });
  //   expect(user && user.confirmed).toBeTruthy();

  //   const chunks = url.split('/');
  //   const redisKey = chunks[chunks.length - 1];
  //   const val = await redis.get(redisKey);

  //   expect(val).toBeNull();
  // });

  // it('returns invalid for invalid confirmation key', async () => {
  //   const client = new TestClient(graphql_endpoint);

  //   const data: RegisterInput = {
  //     email: faker.internet.email(),
  //     password: faker.internet.password(),
  //     firstName: 'first',
  //     lastName: 'last',
  //   };

  //   await client.register(data);

  //   const users = await User.find({ email: data.email });
  //   const { id } = users[0];

  //   const url = (await createConfirmEmailLink(domain, id, redis)) + 'junk';

  //   const response = await fetch(url);
  //   const text = await response.text();

  //   expect(text).toBe('invalid');
  // });
});
