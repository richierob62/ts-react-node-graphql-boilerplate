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

describe('current user', () => {
  it('returns null if no cookie', async () => {
    const client = new TestClient(graphql_endpoint);

    const result = await client.currentUser();

    expect(result.data.currentUser).toEqual(null);
  });

  it('returns current user', async () => {
    const client = new TestClient(graphql_endpoint);

    const email = `first@example.com`;
    const password = 'password';

    await client.register(email, password, 'first', 'last');
    await client.confirmUserByEmail(email);

    await client.login(email, password);
    const result = await client.currentUser();

    const expected = { email, id: 1 };

    expect(result.data.currentUser).toEqual(expected);
  });
});
