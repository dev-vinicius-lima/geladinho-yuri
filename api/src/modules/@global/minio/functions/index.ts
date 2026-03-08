const dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
import * as crypto from 'crypto';

export function formatFileName(nome: string) {
  return nome.replace(/[^a-zA-Z0-9._!~()'-]/g, '_');
}
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
export const limitCharacters = (text: string, limit: number) => {
  if (text.length <= limit) {
    return text;
  } else {
    return text.substring(0, limit) + '...';
  }
};
