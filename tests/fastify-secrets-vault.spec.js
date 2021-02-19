'use strict';

const { secretsPlugin } = require('../lib/fastify-secrets-vault');
const fastify = require('fastify');

jest.mock('../lib/vault-client');

describe('Fastify Secrets Vault', () => {
  const {
    readySpy,
    readSpy,
    nextSpy,
    mockResult,
    constructorSpy
  } = jest.requireMock('../lib/vault-client');
  let server;

  beforeEach(() => {
    readSpy.mockClear();
    readySpy.mockClear();
    constructorSpy.mockClear();
    nextSpy.mockClear();
    mockResult.data = {};
    server = fastify();
  });

  it('Should throw error if no secrets are provided', async () => {
    await expect(secretsPlugin(server, {}, nextSpy)).rejects.toThrow('fastify-secrets-vault: no secrets requested');
  });

  it('Should throw error if plugin is already registered', async () => {
    await secretsPlugin(server, { secrets: { db_password: '/path/to/secret' } }, nextSpy);

    await expect(secretsPlugin(server, { secrets: { db_password: '/path/to/secret' } }, nextSpy))
      .rejects.toThrow('fastify-secrets-vault has already been registered');
  });

  it('Should throw error if namespace already registered', async () => {
    await secretsPlugin(server, {
      namespace: 'db',
      secrets: {
        db_password1: '/path/to/secret'
      }
    }, nextSpy);

    await expect(secretsPlugin(server, {
      namespace: 'db',
      secrets: {
        db_password2: '/path/to/secret'
      }
    }, nextSpy))
      .rejects.toThrow("fastify-secrets-vault 'db' instance name has already been registered");
  });

  it('Should pass correct options to VaultClient', async () => {
    const vaultOptions = {
      apiVersion: 'v2',
      endpoint: 'https://mock.vault.com',
      token: 'token',
      authentication: {
        method: 'ldap',
        credentials: {
          username: 'user',
          password: '12345'
        }
      }
    };
    await secretsPlugin(server, {
      secrets: {
        db_password1: '/path/to/secret',
        db_password2: {
          path: '/path/to/second/secret',
          key: 'data_key'
        }
      },
      vaultOptions
    }, nextSpy);

    expect(constructorSpy).toHaveBeenCalledWith(vaultOptions);
    expect(readySpy).toHaveBeenCalled();
    expect(readSpy).toHaveBeenCalledWith('/path/to/secret');
    expect(readSpy).toHaveBeenCalledWith({
      path: '/path/to/second/secret',
      key: 'data_key'
    });
    expect(nextSpy).toHaveBeenCalled();
  });

  it('Should decorate fastify with secrets', async () => {
    mockResult.data = 'mockSecret';
    await secretsPlugin(server, {
      secrets: {
        db_password1: '/path/to/secret',
        db_password2: {
          path: '/path/to/second/secret',
          key: 'data_key'
        }
      }
    }, nextSpy);

    expect(server.secrets.db_password1).toBe('mockSecret');
    expect(server.secrets.db_password2).toBe('mockSecret');
  });

  it('Should decorate fastify with secrets in specific namespace', async () => {
    mockResult.data = 'mockSecret';
    await secretsPlugin(server, {
      namespace: 'db',
      secrets: {
        password1: '/path/to/secret',
        password2: {
          path: '/path/to/second/secret',
          key: 'data_key'
        }
      }
    }, nextSpy);

    expect(server.secrets.db.password1).toBe('mockSecret');
    expect(server.secrets.db.password2).toBe('mockSecret');
  });
});
