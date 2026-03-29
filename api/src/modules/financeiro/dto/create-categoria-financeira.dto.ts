import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, MaxLength } from 'class-validator';

export class CreateCategoriaFinanceiraDto {
  @ApiProperty({ example: 'Aluguel', description: 'Nome da categoria financeira' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @ApiProperty({
    example: 'despesa',
    description: 'Tipo da categoria',
    enum: ['despesa', 'receita'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['despesa', 'receita'], { message: 'tipo deve ser "despesa" ou "receita"' })
  tipo: string;
}
