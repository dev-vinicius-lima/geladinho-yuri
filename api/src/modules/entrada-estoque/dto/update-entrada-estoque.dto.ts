import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateEntradaEstoqueDto {
  @ApiProperty({ example: 'uuid-do-fornecedor', required: false })
  @IsOptional()
  @IsUUID()
  fornecedor_id?: string;

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
}
