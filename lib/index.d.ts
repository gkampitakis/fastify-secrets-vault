import { FastifyPluginCallback } from 'fastify';
import { ldap } from './authMethods';

interface FastifySecretsVaultOptions {
  namespace?: string;
  secrets: {
    [key: string]: string | { path: string; key?: string | string[] }
  },
  concurrency?: number;
  vaultOptions?: {
    apiVersion?: 'v1' | 'v2';
    endpoint?: string;
    token?: string;
    authentication?: ldap;
  }
}

declare const fastifySecretsVault: FastifyPluginCallback<FastifySecretsVaultOptions>;

export { FastifySecretsVaultOptions, fastifySecretsVault };
export default fastifySecretsVault;
