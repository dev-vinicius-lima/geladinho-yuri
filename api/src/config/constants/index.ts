export const NAME_APLICATION = 'Fácil';

export const MINIO_S3_URL = `${
  process.env.MINIO_USE_SSL ? 'https://' : 'http://'
}${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET_NAME}`;
