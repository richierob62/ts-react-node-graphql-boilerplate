import * as rp from 'request-promise';

import { User } from '../entity/User';

export class TestClient {
  options: {
    jar: any;
    withCredentials: boolean;
    json: boolean;
  };

  constructor(private url: string) {
    this.options = {
      jar: rp.jar(),
      withCredentials: true,
      json: true,
    };
  }

  async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `mutation {
          login(password: "${password}", email: "${email}") {
            path
            message
          }
        }`,
      },
    });
  }

  async currentUser() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `{
          currentUser{
            id
            email
          }
        }`,
      },
    });
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `mutation {
          logout
        }`,
      },
    });
  }

  async confirmUserByEmail(email: string) {
    await User.update({ email }, { confirmed: true });
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `mutation {
          register(firstName: "${firstName}", lastName: "${lastName}", password: "${password}", email: "${email}", profile: {
            favoriteColor: "green"
          }) {
            path
            message
          }
        }`,
      },
    });
  }
}
