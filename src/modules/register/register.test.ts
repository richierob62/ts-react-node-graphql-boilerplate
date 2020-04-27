import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import createTypeormConnection from '../../utils/create_typeorm_connection';
import { request } from 'graphql-request';

const graphql_endpoint = 'http://localhost:3001/graphql';
let conn: Connection;

beforeEach(async () => {
  conn = await createTypeormConnection();
});

afterEach(async () => {
  await conn.close();
});

test('Can register user', async () => {
  const email = `first@example.com`;

  const mutation = `mutation {
    register(firstName: "first name", lastName: "last name", password: "123", email: "${email}", profile: {
      favoriteColor: "green"
    }) {
      path
      message
    }
  }`;

  const expected = {
    register: null,
  };

  const response = await request(graphql_endpoint, mutation);

  expect(response).toEqual(expected);

  const users = await User.find({ email });
  expect(users).toHaveLength(1);
  expect(users[0].email).toEqual(email);
  expect(users[0].password).not.toEqual('123');
});

test('Returns error for duplicate email', async () => {
  const email = `first@example.com`;

  const mutation = `mutation {
    register(firstName: "first name", lastName: "last name", password: "123", email: "${email}", profile: {
      favoriteColor: "green"
    }) {
      path
      message
    }
  }`;

  await request(graphql_endpoint, mutation);

  const response = await request(graphql_endpoint, mutation);

  const expected = {
    register: [{ path: 'email', message: 'email already registered' }],
  };

  expect(response).toEqual(expected);
});

test('Checks valid email and password', async () => {
  const mutation = `mutation {
    register(firstName: "first name", lastName: "last name", password: "", email: "id", profile: {
      favoriteColor: "green"
    }) {
      path
      message
    }
  }`;

  const response = await request(graphql_endpoint, mutation);
  expect(response).toEqual({
    register: [
      {
        message: 'email must be at least 3 characters',
        path: 'email',
      },
      { path: 'email', message: 'email must be a valid email' },
      {
        path: 'password',
        message: 'password must be at least 3 characters',
      },
    ],
  });
});
