import * as faker from 'faker';

import { Connection } from 'typeorm';
import { TestClient } from '../../utils/tests/TestClient';
import createTypeormConnection from '../../utils/server/create_typeorm_connection';

const graphql_endpoint = 'http://localhost:3001/graphql';

let conn: Connection;

beforeEach(async () => {
  conn = await createTypeormConnection();
});

afterEach(async () => {
  await conn.close();
});

describe('login', () => {
  it('can login user', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = faker.internet.email();
    const password = faker.internet.password();

    await client.register(email, password, 'first', 'last');
    await client.confirmUserByEmail(email);

    const result = await client.login(email, password);

    expect(result.data).toEqual({ login: null });
  });

  it('can returns error for bad creds', async () => {
    const client = new TestClient(graphql_endpoint);
    const email = faker.internet.email();
    const password = faker.internet.password();

    await client.register(email, password, 'first', 'last');
    await client.confirmUserByEmail(email);

    const result = await client.login(email, 'bad_password');

    let expected = {
      login: [
        {
          message: 'Invalid credentials',
          path: 'email',
        },
      ],
    };

    expect(result.data).toEqual(expected);

    const result2 = await client.login('bad_email@bad.com', password);

    expected = {
      login: [
        {
          message: 'Invalid credentials',
          path: 'email',
        },
      ],
    };

    expect(result2.data).toEqual(expected);
  });

  it('handles unconfirmed email', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = faker.internet.email();
    const password = faker.internet.password();

    await client.register(email, password, 'first', 'last');

    const result = await client.login(email, password);

    const expected = {
      login: [
        {
          message: 'Please confirm your email address (see email sent)',
          path: 'email',
        },
      ],
    };

    expect(result.data).toEqual(expected);
  });
});
