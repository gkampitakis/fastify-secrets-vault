'use strict';

const fp = require('fastify-plugin');
const { secretsPlugin } = require('./fastify-secrets-vault');

module.exports = fp(secretsPlugin, {
  fastify: '>=3.0.0',
  name: 'fastify-secrets-vault'
});
