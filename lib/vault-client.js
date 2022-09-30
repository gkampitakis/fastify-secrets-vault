'use strict';

const fetch = require('node-fetch');

class VaultClient {
  constructor (options = {}) {
    this.endpoint = options.endpoint || 'http://127.0.0.1:8200';
    this.secretsEngineVersion = options.secretsEngineVersion || 'v2';
    this.token = options.token;
    this.authentication = options.authentication;
  }

  read (value) {
    let path = value;
    let key = '';

    if (typeof value === 'object') {
      path = value.path;
      key = value.key;
    }

    return fetch(`${this.endpoint}/v1/${path}`, {
      method: 'GET',
      headers: {
        'X-Vault-Token': this.token,
        'Content-type': 'application/json'
      }
    })
      .then(data => data.json())
      .then(({ data, errors }) => {
        if (errors && errors.length) {
          throw new Error(errors[0]);
        }
        if (!data) throw new Error(`Secret: '${path}' not found`);
        const secret = this.secretsEngineVersion === 'v2' ? data.data : data;

        if (key) {
          if (Array.isArray(key)) {
            return key.reduce((acc, k) => {
              const datum = secret[k];
              if (!datum) throw Error(`Key: '${k}' not found`);

              return { ...acc, [k]: datum };
            }, {});
          }

          const datum = secret[key];
          if (!datum) throw Error(`Key: '${key}' not found`);

          return datum;
        }
        return secret;
      });
  }

  ready () {
    if (this.token) return Promise.resolve();

    return this.getToken();
  }

  async getToken () {
    const { method, credentials } = this.authentication;
    const authenticate = authMethods[method];
    const url = `${this.endpoint}/v1`;

    if (!authenticate) {
      throw Error('fastify-secrets-vault: unknown authentication method');
    }

    this.token = await authenticate(url, credentials);
  }
}

const authMethods = {
  ldap: (endpoint, credentials) => {
    const { username, password } = credentials;
    const url = `${endpoint}/auth/ldap/login/${username}`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ password })
    })
      .then(data => data.json())
      .then((data) => data.auth.client_token);
  },
  approle: (endpoint, credentials) => {
    const { roleId, secretId } = credentials;
    const url = `${endpoint}/auth/approle/login`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ role_id: roleId, secret_id: secretId })
    })
      .then(data => data.json())
      .then((data) => data.auth.client_token);
  }
};

module.exports = VaultClient;
