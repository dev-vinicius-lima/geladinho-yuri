import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AbrirCaixaDto {
  @ApiProperty({ example: 50.00, description: 'Fundo de caixa (valor inicial em dinheiro)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  valor_abertura: number;

  @ApiProperty({ example: 'Turno da manhã', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}
