import { LoginInput } from '../../modules/login/login_input';
import { RegisterInput } from '../../modules/register/RegisterInput';
import { User } from '../../entity/User';
import axios from 'axios';

export class TestClient {
  async login(data: LoginInput) {
    const transport = axios.create({
      withCredentials: true,
    });

    const result = await transport.post(process.env.GRAPHQL_URI as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: loginMutation,
        variables: { data },
      }),
    });

    return result;
  }

  async currentUser() {
    const transport = axios.create({
      withCredentials: true,
    });

    const result = await transport.post(process.env.GRAPHQL_URI as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: currentUserQuery,
      }),
    });

    return result;
  }

  // async logout() {
  //   return rp.post(this.url, {
  //     ...this.options,
  //     body: {
  //       query: `mutation {
  //         logout
  //       }`,
  //     },
  //   });
  // }

  // async resetPassword(newPassword: string, key: string) {
  //   return rp.post(this.url, {
  //     ...this.options,
  //     body: {
  //       query: `mutation {
  //         resetPassword(newPassword: "${newPassword}", key: "${key}") {
  //           path
  //           message
  //         }
  //       }`,
  //     },
  //   });
  // }

  async confirmEmail(token: string) {
    const confirmEmailMutation = `
    mutation ($token: string!) {
      confirmEmail(token: $token)
    }
  `;

    const transport = axios.create({
      withCredentials: true,
    });

    const result = await transport.post(process.env.GRAPHQL_URI as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: confirmEmailMutation,
        variables: { token },
      }),
    });

    return result;
  }

  async register(data: RegisterInput) {
    const transport = axios.create({
      withCredentials: true,
    });

    const result = await transport.post(process.env.GRAPHQL_URI as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: registerMutation,
        variables: { data },
      }),
    });

    return result;
  }
}
