export interface BufferedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
export interface UploadOptions {
  pastaDestino?: string;
  objetoDestino?: string;
}
export interface ResultBag<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}
