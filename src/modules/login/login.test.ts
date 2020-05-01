import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import createTypeormConnection from '../../utils/create_typeorm_connection';
import { request } from 'graphql-request';

const graphql_endpoint = 'http://localhost:3001/graphql';

let conn: Connection;

const registerMutation = (email: string, password: string) => `mutation {
  register(firstName: "first name", lastName: "last name", password: "${password}", email: "${email}", profile: {
    favoriteColor: "green"
  }) {
    path
    message
  }
}`;

const loginMutation = (email: string, password: string) => `mutation {
  login(password: "${password}", email: "${email}") {
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

describe('login', () => {
  it('can login user', async () => {
    const email = `first@example.com`;
    const pw = 'password';

    const register = registerMutation(email, pw);

    await request(graphql_endpoint, register);

    // mark as confirmed
    const user = (await User.findOne({ email })) as User;
    user.confirmed = true;
    await user.save();

    const login = loginMutation(email, pw);

    const result = await request(graphql_endpoint, login);

    expect(result).toEqual({ login: null });
  });

  it('can returns error for bad creds', async () => {
    const email = `first@example.com`;
    const pw = 'password';

    const register = registerMutation(email, pw);

    await request(graphql_endpoint, register);

    // mark as confirmed
    const user = (await User.findOne({ email })) as User;
    user.confirmed = true;
    await user.save();

    let login = loginMutation('bademail@email.com', pw);

    let result = await request(graphql_endpoint, login);

    let expected = {
      login: [
        {
          message: 'Invalid credentials',
          path: 'email',
        },
      ],
    };

    expect(result).toEqual(expected);

    login = loginMutation(email, 'bad_password');

    result = await request(graphql_endpoint, login);

    expected = {
      login: [
        {
          message: 'Invalid credentials',
          path: 'email',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('handles unconfirmed email', async () => {
    const email = `first@example.com`;
    const pw = 'password';

    const register = registerMutation(email, pw);

    await request(graphql_endpoint, register);

    const login = loginMutation(email, pw);

    const result = await request(graphql_endpoint, login);

    const expected = {
      login: [
        {
          message: 'Please confirm your email address (see email sent)',
          path: 'email',
        },
      ],
    };

    expect(result).toEqual(expected);
  });
});
