# Fastify Secrets Vault

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/standard/semistandard)
[![dependencies Status](https://status.david-dm.org/gh/gkampitakis/fastify-secrets-vault.svg)](https://david-dm.org/gkampitakis/fastify-secrets-vault)

Fastify secrets plugin for [HashiCorp's Vault](https://www.vaultproject.io/).

> ⚠️ Still under development, changes on the api might happen.

## Install

```bash
npm install --save fastify-secrets-vault
```

## Usage

You can register the plugin in your fastify instance and provide options for `vault`.

```js
const fastify = require('fastify')();
const secretsPlugin = require('fastify-secrets-vault');

...

fastify.register(secretsPlugin, {
  secrets: {
    mongo_password: '/path/to/secret',
    redis_password: {
      path: 'path/to/secret',
      key: 'master-key' // it can support and array of keys ['key1','key2']
    }
  },
  vaultOptions: {
    token: '*****', //optional token for authenticating requests to vault
    endpoint: 'http://127.0.0.1:8200'
  }
});

await fastify.ready();

...

```

## API

### Register options

-   `namespace`: _(optional)_ The plugin will add the secret values to `fastify.secrets[namespace]`
-   `concurrency`: _(optional)_ How many concurrent secrets you can retrieve. Default value: `5`
-   `secrets`: _(required)_ An object representing a map of secret keys and references. It can be either in the form of:

    -   `redis_password: '/path/to/secret'`

    or

    -   If you want only a specific key

    ```js
    redis_password: {
        path: '/path/to/secret/',
        key: 'main_token'
    }
    ```

    or

    -   If you want to get multiple keys

    ```js
    redis_password: {
        path: '/path/to/secret/',
        key: ['main_token','secondary_token']
    }
    ```

    Then you can access your secrets with `fastify.secrets.main_token`.

-   `vaultOptions`
    -   `secretsEngineVersion`: _(optional)_ Vault KV Secrets Engine can operate in two modes `v1` and `v2`. Default value: `v2`.
    -   `endpoint`: _(optional)_ Endpoint for reaching vault server. Default value: `http://127.0.0.1:8200`.
    -   `token`: _(optional)_ Token to authenticate requests with.
    -   `authentication`: _(optional)_ This can be provided instead of token. It's a way of retrieving a token. Currently supported `ldap`.

### Authentication

#### Ldap

```js
{
   method: 'ldap',
   credentials: {
     password: '*****',
     username: 'username'
   }
}
```

## Typescript

In order to use this plugin you need to enable the flag `"esModuleInterop": true` in `tsconfig.json`.

then you can import it

```typescript
import secretsPlugin from 'fastify-secrets-vault';
```

If you want to have the secrets values into fastify (e.g. `fastify.secrets.main_token`) you can create a `types.ts` containing

```ts
import 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        secrets: {
            mongo_password: string;
            redis_password: string;
        };
    }
}
```

and then `import './types.'` to your server.

## Acknowledgements

This package follows the structure of [fastify-secrets-core](https://github.com/nearform/fastify-secrets-core).
There is another package for Vault published in **Nearform**, [fastify-secrets-hashicorp](https://github.com/nearform/fastify-secrets-hashicorp).

## Example

You can also check an [example](./example) usage.

## Issues

For any [issues](https://github.com/gkampitakis/fastify-secrets-vault/issues).

### License

MIT License
