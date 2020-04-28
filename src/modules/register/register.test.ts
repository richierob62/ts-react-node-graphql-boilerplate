import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { createConfirmEmailLink } from '../../utils/create_confirm_email_link';
import createTypeormConnection from '../../utils/create_typeorm_connection';
import fetch from 'node-fetch';
import { request } from 'graphql-request';
import Redis = require('ioredis');

const graphql_endpoint = 'http://localhost:3001/graphql';
const domain = 'http://localhost:3001';

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

describe('register', () => {
  it('can register user', async () => {
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

  it('returns error for duplicate email', async () => {
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

  it('checks valid email and password', async () => {
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

  it('sends confirmation email', async () => {
    const email = `first@example.com`;
    const pw = 'password';

    const redis = new Redis();

    const mutate = mutation(email, pw);

    await request(graphql_endpoint, mutate);

    const users = await User.find({ email });
    const { id } = users[0];

    const url = await createConfirmEmailLink(domain, id, redis);

    const response = await fetch(url);
    const text = await response.text();

    expect(text).toBe('ok');

    const user = await User.findOne({ id });
    expect(user && user.confirmed).toBeTruthy();

    const chunks = url.split('/');
    const redisKey = chunks[chunks.length - 1];
    const val = await redis.get(redisKey);

    expect(val).toBeNull();
  });
});
