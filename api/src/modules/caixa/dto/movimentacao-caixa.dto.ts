import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class MovimentacaoCaixaDto {
  @ApiProperty({ example: 100.00, description: 'Valor da movimentação' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  valor: number;

  @ApiProperty({ example: 'Pagamento de fornecedor', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descricao?: string;
}
