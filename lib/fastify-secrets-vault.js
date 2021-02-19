'use strict';

const VaultClient = require('./vault-client');
const pProps = require('p-props');
const DEFAULT_GET_CONCURRENCY = 5;

function assertOptions (opts) {
  if (!opts || !Object.keys(opts.secrets || {}).length) {
    throw new Error('fastify-secrets-vault: no secrets requested');
  }
}

function assertPluginAlreadyRegistered (fastify, opts) {
  const { namespace } = opts;

  if (!namespace && fastify.secrets) {
    throw new Error('fastify-secrets-vault has already been registered');
  }

  if (namespace && fastify.secrets && fastify.secrets[namespace]) {
    throw new Error(`fastify-secrets-vault '${namespace}' instance name has already been registered`);
  }
}

async function secretsPlugin (fastify, options, next) {
  assertOptions(options);
  assertPluginAlreadyRegistered(fastify, options);

  const { namespace } = options;
  const concurrency = options.concurrency || DEFAULT_GET_CONCURRENCY;

  const client = new VaultClient(options.vaultOptions);
  await client.ready();

  const secrets = await pProps(options.secrets, value => client.read(value), { concurrency });

  if (namespace) {
    if (!fastify.secrets) {
      fastify.decorate('secrets', {});
    }

    fastify.secrets[namespace] = secrets;
  } else {
    fastify.decorate('secrets', secrets);
  }

  next();
}

module.exports = {
  secretsPlugin
};
