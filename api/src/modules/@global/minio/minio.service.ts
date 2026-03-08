import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { ENV_CONFIG } from 'src/config/envConfig';
import { BufferedFile, ResultBag, UploadOptions } from './@types';
import { formatFileName, formatFolderName } from './functions';
import { MINIO_S3_URL } from 'src/config/constants';
import * as path from 'path';

const nomeBucket = ENV_CONFIG.MINIO_BUCKET_NAME;

@Injectable()
export class MinioClientService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint:
        this.configService.get('MINIO_ENDPOINT') || ENV_CONFIG.MINIO_ENDPOINT,
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
    this.bucketName =
      this.configService.get<string>('MINIO_BUCKET_NAME') ||
      ENV_CONFIG.MINIO_BUCKET_NAME;
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'eu-west-1');
    }
  }

  async uploadFile(file: BufferedFile, options?: UploadOptions) {
    const { pastaDestino, objetoDestino } = options ?? {};

    if (!file?.buffer || !file?.originalname) {
      return {
        success: false,
        message: 'Arquivo inválido. Nenhum conteúdo encontrado.',
      };
    }

    await this.createBucketIfNotExists();

    const pasta = formatFolderName(pastaDestino);

    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const fileName = objetoDestino?.trim()
      ? formatFileName(objetoDestino)
      : `${Date.now()}-${base}${ext}`;

    const filePath = `${pasta}${fileName}`;
    console.log(filePath);

    const contentType = file.mimetype || 'application/octet-stream';

    const metaData = {
      'Content-Type': contentType,
      filename: file.originalname,
    };

    try {
      const result = await this.minioClient.putObject(
        this.bucketName,
        filePath,
        file.buffer,
        file.size,
        metaData,
      );

      console.log(`[MinIO] Arquivo enviado: ${fileName}`);
      return {
        success: true,
        data: {
          ...result,
          url: `${MINIO_S3_URL}/${fileName}`,
          fileName: fileName,
          path: filePath,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return {
          success: false,
          message: 'Erro durante o upload do arquivo',
          error: error.message,
        };
      }

      return {
        success: false,
        message: 'Erro desconhecido durante o upload',
      };
    }
  }

  async getFileUrl(fileName: string) {
    return await this.minioClient.presignedUrl(
      'GET',
      this.bucketName,
      fileName,
    );
  }

  public async deleteFile(filename: string) {
    const pathResult = this.pathObject(filename);
    if (!pathResult.success) {
      return pathResult;
    }
    const path = pathResult?.data ?? '';

    const result = await this.minioClient
      .removeObject(nomeBucket, path)
      .then(() => ({
        success: true,
        message: 'Arquivo removido com sucesso',
      }))
      .catch((error: unknown) => ({
        success: false,
        error,
        message: 'Erro durante a remoção do arquivo',
      }));

    return result as ResultBag;
  }

  private pathObject(url: string): ResultBag<string> {
    if (!url.startsWith(MINIO_S3_URL)) {
      if (!url)
        return {
          success: false,
          message: `URL do objeto não inicia com URL do S3: (S3: ${MINIO_S3_URL}, Objeto: ${url})`,
        };
      else
        return {
          success: true,
          message: `Caminho do objeto definido sem alterações`,
          data: url,
        };
    }
    const path = url.slice(MINIO_S3_URL.length + 1);

    if (!path || path === '/') {
      return {
        success: false,
        message: 'URL do objeto é inválida',
      };
    }
    return {
      message: 'Caminho do objeto definido',
      success: true,
      data: path,
    };
  }
}
