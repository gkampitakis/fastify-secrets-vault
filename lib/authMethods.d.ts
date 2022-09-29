export interface ldap {
  method: 'ldap',
  credentials: {
    password: string;
    username: string;
  }
}

export interface approle {
  method: 'approle',
  credentials: {
    roleId: string;
    secretId: string;
  }
}
