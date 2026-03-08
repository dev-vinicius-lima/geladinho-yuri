import { ListErrorProps } from './types';

export const messageError = (code: string, field: string | null) => {
  const findError = listErrors.find((item) => item.code == code);

  if (field) {
    return `[${findError?.code}]: ${findError?.message} Campo: ${field}`;
  } else if (findError) {
    return `[${findError?.code}]: ${findError?.message}`;
  } else {
    return '[P5006] Ocorreu um erro interno no banco';
  }
};

const listErrors: ListErrorProps[] = [
  {
    code: 'P2001',
    message: 'O valor informado para consulta não existe.',
  },
  {
    code: 'P2002',
    message: 'O valor informado já possui vinculo com outra coluna da tabela.',
  },
  {
    code: 'P2003',
    message: 'O registro a ser deletado, possui dependência com outra tabela.',
  },
  {
    code: 'P2004',
    message: 'Uma restrição falhou no banco de dados.',
  },
  {
    code: 'P2005',
    message: 'O valor informado possui um tipo inválido.',
  },
  {
    code: 'P2012',
    message: 'Falta um valor obrigatório.',
  },
  {
    code: 'P2021',
    message: 'Tabela não existe.',
  },
  {
    code: 'P2025',
    message: 'Registro não encontrado.',
  },
];
