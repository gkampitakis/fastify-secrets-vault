'use strict';

const fastify = require('fastify')();
const fastifySecretsVault = require('../lib');

/**
 * Prerequisites:
 * > Docker installed
 * > vault cli installed
 * 
 * Steps for running example locally
 * 1) Start vault locally by running: 
 *   docker run  -p 8200:8200 -e 'VAULT_LOCAL_CONFIG={"backend": {"file": {"path": "/tmp/config.hcl"}}, "default_lease_ttl": "168h", "max_lease_ttl": "720h"}'  \
 *    --cap-add=IPC_LOCK vault
 * 2) Get the token from the command line. Should be like: 'Root Token: s.27mY0UziMqLuCKIhGcfU0q5O'
 * 3) authenticate your self from command line with "vault login" and provide the token
 * 4) create two secrets 
 *    vault kv put secret/redis_password main=123456 secondary=891011 secret=shhh
 *    vault kv put secret/mongo_password hello=world
 * 5) Add the token to the below configuration and run the server "npm run example"
 */

const configuration = {
  secrets: {
    mongo_password: {
      path: 'secret/data/mongo_password',
      key: 'hello'
    },
    redis_password: {
      path: 'secret/data/redis_password',
      key: ['main', 'secondary']
    }
  },
  vaultOptions: {
    endpoint: 'http://127.0.0.1:8200',
    secretsEngineVersion: 'v2',
    token: '*****'
  }
};

if (configuration.vaultOptions.token === '*****') {
  throw Error('You need to setup vault locally and add the token to configuration');
}

(async () => {
  fastify.register(fastifySecretsVault, configuration);

  await fastify.ready();

  console.log(fastify.secrets.mongo_password);
  console.log(fastify.secrets.redis_password);

  fastify.close();
})();
