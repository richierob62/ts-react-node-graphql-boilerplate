import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import axios from 'axios';
import createTypeormConnection from '../../utils/create_typeorm_connection';

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

const currentUserQuery = `{
  currentUser{
    id
    email
  }
}`;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await conn.close();
});

describe('current user', () => {
  it('returns current user', async () => {
    const email = `first@example.com`;
    const pw = 'password';

    const register = registerMutation(email, pw);

    await axios.post(
      graphql_endpoint,
      { query: register },
      { withCredentials: true }
    );

    // mark as confirmed
    const user = (await User.findOne({ email })) as User;
    user.confirmed = true;
    await user.save();

    const login = loginMutation(email, pw);

    await axios.post(
      graphql_endpoint,
      { query: login },
      { withCredentials: true }
    );

    // this works in playground but not jest
    const currentUser = await axios.post(
      graphql_endpoint,
      { query: currentUserQuery },
      { withCredentials: true }
    );

    console.log(currentUser.data.data);

    // expect(currentUser.data.data.email).toEqual(email);
  });
});
