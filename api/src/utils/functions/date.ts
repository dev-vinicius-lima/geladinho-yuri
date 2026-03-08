import { getUnixTime } from 'date-fns';

export function generateUnixTimeDocument(
  defaultName: string,
  extension = 'pdf',
): string {
  const timestamp = getUnixTime(new Date());
  return `${defaultName}-${timestamp}.${extension}`;
}
