import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
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
import { FORMA_PAGAMENTO } from 'src/common/constants/venda';

export class CreateItemVendaDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  @IsUUID()
  @IsNotEmpty()
  produto_id: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantidade: number;
}

export class CreateVendaDto {
  @ApiProperty({ type: [CreateItemVendaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemVendaDto)
  itens: CreateItemVendaDto[];

  @ApiProperty({
    enum: Object.values(FORMA_PAGAMENTO),
    example: 'pix',
    default: 'dinheiro',
  })
  @IsIn(Object.values(FORMA_PAGAMENTO))
  forma_pagamento: string;

  @ApiProperty({
    example: 20.00,
    required: false,
    description: 'Valor recebido em dinheiro (obrigatório quando forma_pagamento = dinheiro)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  valor_recebido?: number;

  @ApiProperty({ example: 0, required: false, description: 'Desconto em R$' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  desconto?: number;

  @ApiProperty({ example: 'Cliente pediu sem gelo', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observacao?: string;
}
