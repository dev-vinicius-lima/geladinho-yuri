import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

// Não permite alterar CPF nem senha pelo update padrão
export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['cpf', 'senha'] as const),
) {}
