import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiProperty({ example: 'João', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apelido?: string;

  @ApiProperty({ example: '02516496281', description: 'CPF sem pontuação (11 dígitos)' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos' })
  cpf: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '11999999999', required: false })
  @IsOptional()
  @IsString()
  @Length(10, 11)
  telefone?: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @ApiProperty({ example: false, required: false, description: 'Se true, o usuário é administrador do sistema' })
  @IsOptional()
  @IsBoolean()
  administrador?: boolean;
}
