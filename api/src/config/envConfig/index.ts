export const ENV_CONFIG = {
  APP_VERSION: process.env.APP_VERSION ?? '',

  SWAGGER_TITLE: process.env.SWAGGER_TITLE ?? '',
  SWAGGER_DESCRIPTION: process.env.SWAGGER_DESCRIPTION ?? '',
  SWAGGER_VERSION: process.env.SWAGGER_VERSION ?? '',
  SWAGGER_ENDPOINT: process.env.SWAGGER_ENDPOINT ?? '',
  SWAGGER_API_URL: process.env.SWAGGER_API_URL ?? '',

  JWT_AT_SECRET: process.env.JWT_AT_SECRET ?? '',
  JWT_AT_EXPIRES: process.env.JWT_AT_EXPIRES ?? '',
  JWT_RT_SECRET: process.env.JWT_RT_SECRET ?? '',
  JWT_RT_EXPIRES: process.env.JWT_RT_EXPIRES ?? '',

  SECRET_RECOVERY: process.env.SECRET_RECOVERY ?? '',

  MAIL_HOST: process.env.MAIL_HOST ?? '',
  MAIL_PORT: process.env.MAIL_PORT ?? '',
  MAIL_AUTH_USER: process.env.MAIL_AUTH_USER ?? '',
  MAIL_AUTH_PASS: process.env.MAIL_AUTH_PASS ?? '',
  MAIL_FROM: process.env.MAIL_FROM ?? '',

  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ?? '',
  MINIO_USE_SSL: process.env.MINIO_USE_SSL ?? '',
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY ?? '',
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY ?? '',
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME ?? '',
};
