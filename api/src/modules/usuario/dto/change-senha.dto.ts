import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeSenhaDto {
  @ApiProperty({ example: '123456', description: 'Senha atual' })
  @IsString()
  @IsNotEmpty()
  senha_atual: string;

  @ApiProperty({ example: 'nova1234', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  nova_senha: string;
}
