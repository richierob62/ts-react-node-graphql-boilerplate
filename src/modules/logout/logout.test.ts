import { Connection } from 'typeorm';
import { TestClient } from '../../utils/TestClient';
import createTypeormConnection from '../../utils/create_typeorm_connection';

const graphql_endpoint = 'http://localhost:3001/graphql';

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await conn.close();
});

describe('logout', () => {
  it('logs out current user', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = `first@example.com`;
    const password = 'password';

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
