'use strict';

const fetch = require('node-fetch');

class VaultClient {
  constructor (options) {
    this.endpoint = options.endpoint || 'http://127.0.0.1:8200';
    this.apiVersion = options.apiVersion || 'v1';
    this.token = options.token;
    this.authentication = options.authentication;
  }

  read (value) {
    let path = value, key = '';

    if (typeof value === 'object') {
      path = value.path;
      key = value.key
    }

    return fetch(`${this.endpoint}/${this.apiVersion}/${path}`, {
      method: 'GET',
      headers: {
        'X-Vault-Token': this.token,
        'Content-type': 'application/json'
      }
    })
      .then(data => data.json())
      .then(data => {
        // const result = data.json(); //TODO: here i want to investigate if every time the response is like data.data[key]

        // console.log(data);

        return data;
      });
  }



  ready () {
    if (this.token) return Promise.resolve();

    return this.getToken();
  }

  async getToken () {
    const { method, credentials } = this.authentication;
    const authenticate = authMethods[method];
    const url = `${this.endpoint}/${this.apiVersion}`;

    if (!authenticate) {
      throw Error('fastify-secrets-vault: unknown authentication method');
    }

    this.token = await authenticate(url, credentials);

    return;
  }
}

const authMethods = {
  'ldap': (endpoint, credentials) => {
    const { username, password } = credentials;
    const url = `${endpoint}/auth/ldap/login/${username}`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        password
      })
    })
      .then(data => data.json())
      .then((data) => data.auth.client_token);
  }
};

module.exports = VaultClient;