import { BadRequestException, NotFoundException } from '@nestjs/common';

export const uuidNotFound = (uuid: string) => {
  if (uuid.length != 36) throw new NotFoundException('Não Encontrado');
};

export const uuidBadRequest = (uuid: string) => {
  if (uuid.length != 36) throw new BadRequestException('Não Encontrado');
};

export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 1) {
    return errors[0];
  }

  return errors.map((msg) => `• ${msg}`).join('\n');
};
