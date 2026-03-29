import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TIPO_MOVIMENTACAO_ESTOQUE } from 'src/common/constants/estoque';

export class MovimentacaoEstoqueDto {
  @ApiProperty({
    enum: ['entrada', 'saida', 'ajuste'],
    example: 'entrada',
    description: 'Tipo da movimentação manual',
  })
  @IsIn([
    TIPO_MOVIMENTACAO_ESTOQUE.ENTRADA,
    TIPO_MOVIMENTACAO_ESTOQUE.SAIDA,
    TIPO_MOVIMENTACAO_ESTOQUE.AJUSTE,
  ])
  tipo: string;

  @ApiProperty({ example: 50, description: 'Quantidade a movimentar' })
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiProperty({ example: 'Recebimento do fornecedor X', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;
}
