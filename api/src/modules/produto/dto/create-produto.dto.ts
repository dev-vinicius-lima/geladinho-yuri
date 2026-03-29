import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProdutoDto {
  @ApiProperty({ example: 'Coca-Cola Lata 350ml' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @ApiProperty({ example: 'Refrigerante gelado', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descricao?: string;

  @ApiProperty({ example: '7891000100103', required: false, description: 'Código de barras / SKU' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigo?: string;

  @ApiProperty({ example: 'un', required: false, description: 'Unidade: un, kg, L, cx, etc.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unidade?: string;

  @ApiProperty({ example: 5.50, description: 'Preço de venda' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  preco: number;

  @ApiProperty({ example: 2.80, required: false, description: 'Preço de custo (para calcular margem)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  preco_custo?: number;

  @ApiProperty({ example: 100, description: 'Quantidade inicial em estoque' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantidade: number;

  @ApiProperty({ example: 10, required: false, description: 'Quantidade mínima antes de alertar estoque crítico' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estoque_minimo?: number;

  @ApiProperty({ example: 'uuid-da-categoria' })
  @IsUUID()
  @IsNotEmpty()
  categoria_id: string;
}
