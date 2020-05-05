import { Connection } from 'typeorm';
import { TestClient } from '../../utils/tests/TestClient';
import { User } from '../../entity/User';
import { createForgotPasswordEmailLink } from '../../utils/auth/create_forgot_password_email_link';
import createTypeormConnection from '../../utils/server/create_typeorm_connection';
import { lockAccountOnForgotPassword } from '../../utils/auth/lock_account_on_forgot_password';

import Redis = require('ioredis');
const redis = new Redis();

const graphql_endpoint = 'http://localhost:3001/graphql';

let conn: Connection;

beforeEach(async () => {
  conn = await createTypeormConnection();
});

afterEach(async () => {
  await conn.close();
});

describe('forgot_password', () => {
  it('can change password with key from email', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = `first@example.com`;
    const password = 'password';

    await client.register(email, password, 'first', 'last');
    await client.confirmUserByEmail(email);

    const user = (await User.findOne({ email })) as User;

    await lockAccountOnForgotPassword(user.id, redis);

    const resultLogin = await client.login(email, password);

    expect(resultLogin).toEqual({
      data: {
        login: [
          {
            path: 'email',
            message: 'Your account has been locked',
          },
        ],
      },
    });

    const url = await createForgotPasswordEmailLink(
      'something',
      user.id,
      redis
    );

    const chunks = url.split('/');
    const key = chunks[chunks.length - 1];

    const resultBadPassword = await client.resetPassword('a', key);

    expect(resultBadPassword).toEqual({
      data: {
        resetPassword: [
          {
            path: 'password',
            message: 'password must be at least 3 characters',
          },
        ],
      },
    });

    const newPassword = 'new_pass';

    const resultPasswordChange = await client.resetPassword(newPassword, key);

    expect(resultPasswordChange.data.resetPassword).toBeNull();

    const resultMultipleAttempts = await client.resetPassword(
      'somethingNew',
      key
    );

    expect(resultMultipleAttempts).toEqual({
      data: {
        resetPassword: [
          {
            path: 'reset_password',
            message: 'password link has expired',
          },
        ],
      },
    });

    // const result2 = await client.login(email, newPassword);

    // expect(result2.data.login).toBeNull();
  });
});
