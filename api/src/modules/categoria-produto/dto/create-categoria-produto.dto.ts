import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoriaProdutoDto {
  @ApiProperty({ example: 'Bebidas', description: 'Nome da categoria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nome: string;

  @ApiProperty({ example: 'Refrigerantes, sucos e águas', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descricao?: string;
}
