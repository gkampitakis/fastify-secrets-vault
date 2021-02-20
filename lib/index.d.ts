import { FastifyPluginCallback } from 'fastify';
import { ldap } from './authMethods';

interface FastifySecretsVaultOptions {
  /**
   * The plugin will add the secret values to fastify.secrets[namespace]
   */
  namespace?: string;
  /**
   * An object representing a map of secret keys and references. It can be either in the form
   * of secret: 'path/to/secret', secret: { path: 'path/to/secret', key: 'key' } where key can be a specific value
   * you want to retrieve from the secret returned object or secret: { path: 'path/to/secret', key: ['key1','key2'] } when you want multiple keys. 
   */
  secrets: {
    [secret: string]: string | { path: string; key?: string | string[] }
  },
  /**
   * How many concurrent secrets you can retrieve. Default value: 5
   */
  concurrency?: number;
  vaultOptions?: {
    /**
     *  Vault api version. Default value: 'v1'
     */
    apiVersion?: 'v1' | 'v2';
    /**
     * Endpoint for reaching vault server. Default value: 'http://127.0.0.1:8200'
     */
    endpoint?: string;
    /**
     * Token to authenticate requests with
     */
    token?: string;
    /**
     * This can be provided instead of token. It's a way of retrieving a token.
     * Currently supported: 'ldap'.
     */
    authentication?: ldap;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    secrets: unknown;
  }
}

declare const fastifySecretsVault: FastifyPluginCallback<FastifySecretsVaultOptions>;

export { FastifySecretsVaultOptions, fastifySecretsVault };
export default fastifySecretsVault;
