import { decryptLocal, encryptLocal } from 'src/utils/functions/security';

class TokenRecovery {
  create(email: string) {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 60); // 60 minutos
    const expireInUnix = Math.floor(currentDate.getTime() / 1000);

    const data = {
      email: email,
      expiresIn: expireInUnix,
    };

    const encrypted = encryptLocal(data);

    return encrypted;
  }

  verify(stringToken: string) {
    const encryptedHex = stringToken;

    const dataToken = decryptLocal(encryptedHex);

    const currentDate = new Date();
    const currentUnixTime = Math.floor(currentDate.getTime() / 1000);

    return {
      data: dataToken,
      isValid: !(currentUnixTime > dataToken.expiresIn),
    };
  }

  createCodigo(email: string, minutosExpiracao = 30) {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + minutosExpiracao);
    const expireInUnix = Math.floor(currentDate.getTime() / 1000);

    const data = {
      email: email,
      codigo: codigo,
      expiresIn: expireInUnix,
    };

    const encrypted = encryptLocal(data);

    return { codigo, encrypted };
  }
}

export { TokenRecovery };
