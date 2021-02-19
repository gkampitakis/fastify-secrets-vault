'use strict';

const VaultClient = require('../lib/vault-client');

jest.mock('node-fetch');

describe('Vault Client', () => {
  const { options, callSpy } = jest.requireMock('node-fetch');

  beforeEach(() => {
    callSpy.mockClear();
    options.error = false;
    options.results = {};
  });

  describe('Initialize', () => {
    it('Should apply default values', () => {
      const client = new VaultClient();

      expect(client.token).toBe(undefined);
      expect(client.authentication).toBe(undefined);
      expect(client.apiVersion).toBe('v1');
      expect(client.endpoint).toBe('http://127.0.0.1:8200');
    });

    it('Should pass options', () => {
      const client = new VaultClient({
        apiVersion: 'v2',
        authentication: {},
        endpoint: 'http://mock.vault.com',
        token: 'token'
      });

      expect(client.token).toBe('token');
      expect(client.authentication).toEqual({});
      expect(client.apiVersion).toBe('v2');
      expect(client.endpoint).toBe('http://mock.vault.com');
    });
  });

  describe('Ready method', () => {
    it('Should not retrieve token', async () => {
      const client = new VaultClient({
        token: 'token'
      });

      await client.ready();

      expect(callSpy).not.toHaveBeenCalled();
    });

    describe('Authentication', () => {
      describe('Ldap', () => {
        it('Should retrieve token with ldap', async () => {
          const client = new VaultClient({
            authentication: {
              method: 'ldap',
              credentials: {
                password: '****',
                username: 'user'
              }
            }
          });
          const endpoint = 'http://127.0.0.1:8200/v1/auth/ldap/login/user';
          options.results = {
            auth: {
              client_token: 'token'
            }
          };

          await client.ready();

          expect(callSpy).toHaveBeenCalledWith(endpoint, {
            method: 'POST',
            headers: {
              'Content-type': 'application/json'
            },
            body: JSON.stringify({ password: '****' })
          });
          expect(client.token).toBe('token');
        });

        it('Should throw error if unknown auth method', async () => {
          const client = new VaultClient({
            authentication: {
              method: 'pass'
            }
          });

          await expect(client.ready()).rejects.toThrow('fastify-secrets-vault: unknown authentication method');
        });
      });
    });
  });

  describe('Read method', () => {
    it('Should handle string param', async () => {
      const client = new VaultClient({
        token: 'token'
      });
      options.results = {
        data: {
          data: 'mySecretData'
        }
      };

      const secret = await client.read('/path/to/secret');
      expect(secret).toBe('mySecretData');
    });

    it('Should handle object param', async () => {
      const client = new VaultClient({
        token: 'token'
      });
      options.results = {
        data: {
          data: {
            key1: 'mySecretData1',
            key2: 'mySecretData2'
          }
        }
      };

      const secret = await client.read({
        path: '/path/to/secret',
        key: 'key2'
      });
      expect(secret).toBe('mySecretData2');
    });

    it('Should handle multiple keys', async () => {
      const client = new VaultClient({
        token: 'token'
      });
      options.results = {
        data: {
          data: {
            key1: 'mySecretData1',
            key2: 'mySecretData2',
            key3: 'mySecretData3'
          }
        }
      };

      const secret = await client.read({
        path: '/path/to/secret',
        key: ['key2', 'key3']
      });
      expect(secret).toEqual({ key2: 'mySecretData2', key3: 'mySecretData3' });
    });

    it('Should throw error for missing secret', async () => {
      const client = new VaultClient({
        token: 'token'
      });
      const path = '/path/to/secret';

      await expect(client.read(path)).rejects.toThrow(`Secret: '${path}' not found`);
    });

    it('Should throw error for missing key', async () => {
      const client = new VaultClient({
        token: 'token'
      });
      options.results = {
        data: {
          data: {}
        }
      };
      const value = {
        path: '/path/to/secret',
        key: 'key'
      };

      await expect(client.read(value)).rejects.toThrow("Key: 'key' not found");
    });

    it('Should throw error for missing key', async () => {
      const client = new VaultClient({
        token: 'token'
      });
      options.results = {
        data: {
          data: {
            key: 'data'
          }
        }
      };
      const value = {
        path: '/path/to/secret',
        key: ['key', 'key2']
      };

      await expect(client.read(value)).rejects.toThrow("Key: 'key2' not found");
    });
  });
});