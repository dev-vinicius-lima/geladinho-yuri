import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemEntradaDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  @IsUUID()
  @IsNotEmpty()
  produto_id: string;

  @ApiProperty({ example: 10, description: 'Quantidade comprada' })
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiProperty({ example: 2.5, description: 'Preço unitário de compra' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  preco_unitario: number;
}

export class CreateEntradaEstoqueDto {
  @ApiProperty({ example: 'uuid-do-fornecedor' })
  @IsUUID()
  @IsNotEmpty()
  fornecedor_id: string;

  @ApiProperty({ example: 'NF-001234', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nota_fiscal?: string;

  @ApiProperty({ example: '2026-03-28', required: false, description: 'Data de emissão da nota fiscal' })
  @IsOptional()
  @IsDateString()
  data_emissao?: string;

  @ApiProperty({ example: 'Compra semanal de insumos', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;

  @ApiProperty({ type: [ItemEntradaDto], description: 'Itens da entrada de estoque' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemEntradaDto)
  itens: ItemEntradaDto[];
}
