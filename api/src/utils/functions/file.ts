import {
  CellObject,
  read as readXlsx,
  Sheet2JSONOpts,
  utils as utilsXlsx,
} from 'xlsx';
import * as crypto from 'crypto';
import { File, Blob } from 'buffer';
import { BufferedFile } from 'src/modules/@global/minio/@types';

const dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

type XlsxRow = {
  [key: string]: {
    value: any;
    location: string;
    header: string;
  };
};

export function formatFolderName(folder?: string) {
  folder = folder?.trim();
  if (!folder) return '';
  if (folder.startsWith('/')) folder = folder.slice(1);
  else if (folder.endsWith('/')) folder = folder.slice(0, -1);
  else return folder + '/';
  return formatFolderName(folder);
}

export function generateFileName({
  noTimestamp = false,
  type = '',
  minlength = 5,
  maxlength = 15,
}) {
  const stamp = noTimestamp ? '' : Date.now().toString() + '-';
  const length =
    Math.floor(Math.random() * (maxlength - minlength + 1)) + minlength;
  let hash = '';
  while (hash.length < length) hash += dict[crypto.randomInt(0, dict.length)];
  if (type?.length > 0) type = '.' + type;
  return stamp + hash + type;
}

export function splitFileName(fileName: string) {
  fileName = fileName?.trim();
  if (!fileName || typeof fileName !== 'string') return { name: '', type: '' };
  const index = fileName.lastIndexOf('.');
  const name = index !== -1 ? fileName.slice(0, index).trim() : fileName;
  const type = index !== -1 ? fileName.slice(index + 1).trim() : '';
  return { name: name, type: type };
}

export const xlsxToJson = <T>(
  file: Express.Multer.File,
  jsonCofig?: Sheet2JSONOpts,
) => {
  const data = readXlsx(file.buffer, { type: 'buffer' });

  const newDataObjects: T[] = [];

  for (const sheetName of data.SheetNames) {
    const sheet = data.Sheets[sheetName];
    const rowObject = utilsXlsx.sheet_to_json(sheet, jsonCofig);
    const lowerCaseRowObject = rowObject.map(toLowerCaseKeys) as T[];

    newDataObjects.push(...lowerCaseRowObject);
  }

  return newDataObjects;
};

export const xlsxToJsonDetails = <T>(file: Express.Multer.File) => {
  const data = readXlsx(file.buffer, { type: 'buffer' });

  const newDataObjects: T[] = [];

  for (const sheetName of data.SheetNames) {
    const sheet = data.Sheets[sheetName];

    const range = utilsXlsx.decode_range(sheet['!ref']!);

    const rang = {
      row_inicio: 1,
      row_fim: range.e.r,
      col_inicio: range.s.c,
      col_fim: range.e.c,
    };

    for (let row = rang.row_inicio; row <= rang.row_fim; row++) {
      const rowObj: XlsxRow = {};

      for (let col = rang.col_inicio; col <= rang.col_fim; col++) {
        const cellAddress = utilsXlsx.encode_cell({ r: row, c: col });
        const cell = sheet[cellAddress] as CellObject;

        const headerAddress = utilsXlsx.encode_cell({ r: range.s.r, c: col });
        const headerCell = sheet[headerAddress] as CellObject;

        const headerName = headerCell?.v as string;
        const cellValue = cell?.v;

        const fieldName = headerName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_');

        rowObj[fieldName] = {
          value: cellValue,
          location: cellAddress,
          header: headerName,
        };
      }
      const hasAnyValue = Object.values(rowObj).some(
        (c) => c.value !== undefined && c.value !== null && c.value !== '',
      );

      if (Object.keys(rowObj).length > 0) {
        if (hasAnyValue) newDataObjects.push(rowObj as T);
      }
    }
  }

  return newDataObjects;
};
/**
 * @param obj  objeto
 * essa função serve para deixa todas as chaves minusculas do objeto
 */
export const toLowerCaseKeys = <T extends object>(
  obj: T,
): { [key: string]: T[keyof T] } => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const lowerCaseKey = key
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');

      acc[lowerCaseKey] = obj[key as keyof T];
      return acc;
    },
    {} as { [key: string]: T[keyof T] },
  );
};

export const transformJsonToFile = (
  data: Record<string, any> | Record<string, any>[],
  fileName: string = `json-file-${Date.now()}.json`,
) => {
  const blob = new Blob([JSON.stringify(data)]);

  const file = new File([blob], fileName, {
    type: 'application/json',
  });

  return file;
};

export const convertBufferToUploaded = (
  buffer: Buffer,
  fileName: string,
  mimeType: string,
) => {
  const itens: BufferedFile = {
    buffer: buffer,
    encoding: '7bit',
    mimetype: mimeType,
    originalname: fileName,
    size: buffer.length,
    fieldname: fileName,
  };

  return itens;
};
