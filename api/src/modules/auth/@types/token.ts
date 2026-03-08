import { usuario } from 'generated/prisma';

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type DataTokenType = {
  sub: string; // o id do usuario está aqui
  perfis: string[];
  admin: boolean;
  exp?: number;
};

export type UserDataCreateToken = Pick<
  usuario,
  'administrador' | 'id' | 'apelido' | 'refresh_token'
>;

export type RecoveryTokenType = {
  email: string;
  codigo: string;
  expiresIn: any;
};
