import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ENV_CONFIG } from 'src/config/envConfig';
import {
  DataTokenType,
  RecoveryTokenType,
} from 'src/modules/auth/@types/token';

const secretKey = ENV_CONFIG.SECRET_RECOVERY;
const algorithm = 'aes-256-cbc';

export const comparePassword = async (
  password: string,
  passwordCheck: string,
) => {
  const passwordMatches = await bcrypt.compare(password, passwordCheck);

  return passwordMatches;
};

export const verifyRefreshToken = async (
  jwtService: JwtService,
  refreshToken: string,
) => {
  try {
    const data: Pick<DataTokenType, 'sub'> = await jwtService.verifyAsync(
      refreshToken,
      {
        secret: process.env.JWT_RT_SECRET,
      },
    );

    return {
      data,
      isVerify: true,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao verificar token:', error.message);
    }

    return {
      data: null,
      isVerify: false,
    };
  }
};

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

export const encryptLocal = (data: any) => {
  const iv = randomBytes(16);

  const key = Buffer.from(secretKey, 'hex');

  const cipher = createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    iv,
    cipher.update(JSON.stringify(data), 'utf-8'),
    cipher.final(),
  ]);

  return encrypted.toString('hex');
};

export const decryptLocal = (stringToken: string) => {
  const encryptedHex = stringToken;

  const encryptedBuffer = Buffer.from(encryptedHex, 'hex');

  const iv = encryptedBuffer.subarray(0, 16);

  const key = Buffer.from(secretKey, 'hex');

  const decipher = createDecipheriv(algorithm, key, iv);

  const decryptedBuffer = decipher.update(encryptedBuffer.subarray(16));
  const decryptedData = Buffer.concat([decryptedBuffer, decipher.final()]);

  const dataToken = JSON.parse(
    decryptedData.toString('utf-8'),
  ) as RecoveryTokenType;

  return dataToken;
};
