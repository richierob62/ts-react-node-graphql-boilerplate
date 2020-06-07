import { RegisterInput } from '../../modules/register/register_input';
import fetch from 'node-fetch';

export class TestClient {
  // async login(email: string, password: string) {
  //   return rp.post(this.url, {
  //     ...this.options,
  //     body: {
  //       query: `mutation {
  //         login(password: "${password}", email: "${email}") {
  //           path
  //           message
  //         }
  //       }`,
  //     },
  //   });
  // }

  // async currentUser() {
  //   return rp.post(this.url, {
  //     ...this.options,
  //     body: {
  //       query: `{
  //         currentUser{
  //           id
  //           email
  //         }
  //       }`,
  //     },
  //   });
  // }

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

  // async confirmUserByEmail(email: string) {
  //   await User.update({ email }, { confirmed: true });
  // }

  async register(data: RegisterInput) {
    const registerMutation = `
      mutation register($data: RegisterInput!) {
        register(data: $data) {
          id
          email
        }
      }
    `;

    const result = await fetch(process.env.GRAPHQL_URI as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: registerMutation,
        variables: { data },
      }),
    });

    return await result.json();
  }
}
