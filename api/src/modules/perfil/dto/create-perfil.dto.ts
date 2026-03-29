import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreatePerfilDto {
  @ApiProperty({ example: 'Operador de Caixa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nome: string;

  @ApiProperty({ example: 'operador', description: 'Identificador único em snake_case (sem espaços)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[a-z0-9_]+$/, { message: 'Identificador deve conter apenas letras minúsculas, números e underscore' })
  identificador: string;

  @ApiProperty({ example: false, required: false, description: 'Se true, habilita acesso administrativo' })
  @IsOptional()
  @IsBoolean()
  administrador?: boolean;
}
