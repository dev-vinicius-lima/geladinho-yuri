import * as bcrypt from 'bcrypt';
import { Pagination } from 'src/common/dto/query-paginate.dto';
import { QuerySearchDto } from 'src/common/dto/query-search.dto';

export const takeAndSkipPagination = ({ pageIndex, pageSize }: Pagination) => {
  const take = Number(pageSize);
  const skip = Number(pageIndex) * take;

  return {
    take,
    skip,
  };
};

export const hashData = (data: string) => {
  return bcrypt.hash(data, 10);
};

export const removeMaskedCPF = (cpf: string) => {
  return cpf.replace(/\D/g, '');
};

/**
 * Remove todas as formatações de uma string (CPF, CNPJ, telefone, etc.)
 * Mantém apenas números ou letras e números.
 *
 * @param value - String a ser limpa
 * @param options - Configurações opcionais
 * @returns String sem formatação
 */
export function LimparFormatacoesDeString(
  value: string,
  options?: {
    allowLetters?: boolean;
    allowSpaces?: boolean;
  },
): string {
  if (!value || typeof value !== 'string') return '';

  const { allowLetters = false, allowSpaces = false } = options || {};

  let regexPattern: RegExp;

  if (allowLetters && allowSpaces) {
    regexPattern = /[^a-zA-Z0-9 ]/g; // Mantém letras, números e espaços
  } else if (allowLetters) {
    regexPattern = /[^a-zA-Z0-9]/g; // Mantém apenas letras e números
  } else if (allowSpaces) {
    regexPattern = /[^0-9 ]/g; // Mantém apenas números e espaços
  } else {
    regexPattern = /[^0-9]/g; // Mantém apenas números (default)
  }

  return value.replace(regexPattern, '');
}

export const doExpiresIn = (expiresIn: string) => {
  const typeOfTime = expiresIn.match(/(\d{1,3})([h,m])/);

  if (!typeOfTime) {
    throw new Error(
      'Verifique se a variável de ambiente JWT EXPIRES segue o formato: [0-9][h,m] por exemplo: 1h ou 1m.',
    );
  }

  switch (typeOfTime[2]) {
    case 'h':
      return 60 * 60 * parseInt(typeOfTime[1]);
    case 'm':
      return 60 * parseInt(typeOfTime[1]);
  }
};

export const formatPaginateInLine = (query: QuerySearchDto[]) => {
  const customObject = {};

  for (const item of query) {
    customObject[item.id] = {
      contains: item.value,
      mode: 'insensitive',
    };
  }

  return customObject;
};

export const isDateInRange = (
  dateToCheck: Date,
  startDate: Date,
  endDate: Date,
) => {
  return dateToCheck >= startDate && dateToCheck <= endDate;
};

export const limitCharacters = (text: string, limit: number) => {
  if (text.length <= limit) {
    return text;
  } else {
    return text.substring(0, limit) + '...';
  }
};

export const containsIgnoreCase = (string: string, substring: string) => {
  return string.toLowerCase().includes(substring.toLowerCase());
};

export const clearStringMoney = (item = '') => {
  if (!isNaN(Number(item))) {
    return item;
  }

  return item.replaceAll('.', '').replace(',', '.');
};

export const clearString = (text: string) => {
  return text.replace(/[^a-zA-Z0-9]/g, '');
};

export const clearStringOnlyNumber = (text: string) => {
  return text.replace(/\D/g, '');
};

export const joinSpaces = (string: string, substituteCharacter: string) => {
  if (!string || typeof string !== 'string') {
    return '';
  }
  return string.replace(/\s+/g, substituteCharacter);
};

export const completeWithZeros = (number: number | string, size = 3) => {
  let value = number?.toString();

  while (value?.length < size) {
    value = '0' + value;
  }

  return value;
};

export const removerAccents = (string: string) => {
  return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const separateDigits = (string: string) => {
  const parts = string.split('-');

  if (parts.length < 2) return null;

  const number = parts[0];
  const digit = parts[1];

  return { numero: number, digito: digit };
};

export const promiseReturnNull = () => {
  return new Promise((resolve) => {
    resolve(null);
  });
};

export const extractNumber = (string: string) => {
  const match = string?.match(/\d+/);
  return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
};

/**
 * remove acentos, caracteres especiais e substituindo espaços por underscore
 * @param text - Texto a ser ajustado
 * @returns Texto ajustado
 */
export const ajustarTextoParaSalvarMinio = (text: string): string => {
  return text
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '_') // Substitui espaços (um ou mais) por underscore
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Substitui caracteres especiais por underscore
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_|_$/g, ''); // Remove underscores no início e fim
};
