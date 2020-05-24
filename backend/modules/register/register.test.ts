import { Connection } from 'typeorm';
import { TestClient } from '../../utils/tests/TestClient';
import { User } from '../../entity/User';
import { createConfirmEmailLink } from '../../utils/auth/create_confirm_email_link';
import createTypeormConnection from '../../utils/server/create_typeorm_connection';
import faker from 'faker';
import fetch from 'node-fetch';

import Redis = require('ioredis');

const graphql_endpoint = 'http://localhost:3001/graphql';
const domain = 'http://localhost:3001';

let conn: Connection;
const redis = new Redis();

beforeEach(async () => {
  conn = await createTypeormConnection();
});

afterEach(async () => {
  await conn.close();
});

describe('register', () => {
  it('can register user', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = faker.internet.email();
    const password = faker.internet.password();

    const result = await client.register(email, password, 'first', 'last');

    const expected = {
      register: null,
    };

    expect(result.data).toEqual(expected);

    const users = await User.find({ email });
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
    expect(users[0].password).not.toEqual(password);
  });

  it('returns error for duplicate email', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = faker.internet.email();
    const password = faker.internet.password();

    await client.register(email, password, 'first', 'last');

    const result = await client.register(email, password, 'first', 'last');

    const expected = JSON.stringify({
      register: [{ path: 'email', message: 'email already registered' }],
    });

    expect(JSON.stringify(result.data)).toEqual(expected);
  });

  it('checks for valid email and password', async () => {
    const client = new TestClient(graphql_endpoint);

    const result = await client.register('aa', 'pp', 'first', 'last');

    expect(result.data.register.length).toBe(3);

    const stringifyResponse = JSON.stringify(result);

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
    const client = new TestClient(graphql_endpoint);

    const email = faker.internet.email();
    const password = faker.internet.password();

    await client.register(email, password, 'first', 'last');

    const users = await User.find({ email });
    const { id } = users[0];

    const url = await createConfirmEmailLink(domain, id, redis);

    const response = await fetch(url);
    const text = await response.text();

    expect(text).toContain('<!DOCTYPE html>');

    const user = await User.findOne({ id });
    expect(user && user.confirmed).toBeTruthy();

    const chunks = url.split('/');
    const redisKey = chunks[chunks.length - 1];
    const val = await redis.get(redisKey);

    expect(val).toBeNull();
  });

  it('returns invalid for invalid confirmation key', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = faker.internet.email();
    const password = faker.internet.password();

    await client.register(email, password, 'first', 'last');

    const users = await User.find({ email });
    const { id } = users[0];

    const url = (await createConfirmEmailLink(domain, id, redis)) + 'junk';

    const response = await fetch(url);
    const text = await response.text();

    expect(text).toBe('invalid');
  });
});
