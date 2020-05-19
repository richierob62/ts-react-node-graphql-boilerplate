import * as faker from 'faker';

import { Connection } from 'typeorm';
import { TestClient } from '../../utils/tests/TestClient';
import createTypeormConnection from '../../utils/server/create_typeorm_connection';

const graphql_endpoint = 'http://localhost:3001/graphql';

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await conn.close();
});

describe('logout', () => {
  it('logs user out of multiple sessions', async () => {
    const client1 = new TestClient(graphql_endpoint);
    const client2 = new TestClient(graphql_endpoint);

    const email = faker.internet.email();
    const password = faker.internet.password();

    await client1.register(email, password, 'first', 'last');
    await client1.confirmUserByEmail(email);

    await client1.login(email, password);
    await client2.login(email, password);

    let firstSession = await client1.currentUser();
    let secondSession = await client2.currentUser();

    expect(firstSession).toEqual(secondSession);

    await client1.logout();
    firstSession = await client1.currentUser();
    secondSession = await client2.currentUser();

    expect(firstSession).toEqual(secondSession);
  });

  it('logs out current user from single session', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = faker.internet.email();
    const password = faker.internet.password();

    await client.register(email, password, 'first', 'last');
    await client.confirmUserByEmail(email);

    const result = await client.login(email, password);

    expect(result.data).toEqual({ login: null });

    const result2 = await client.logout();
    expect(result2.data.logout).toEqual(true);

    const result3 = await client.currentUser();
    expect(result3.data.currentUser).toBeNull();
  });
});
