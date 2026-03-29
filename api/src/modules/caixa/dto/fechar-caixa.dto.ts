import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FecharCaixaDto {
  @ApiProperty({ example: 320.50, description: 'Contagem física do dinheiro no caixa ao fechar' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  valor_fechamento: number;

  @ApiProperty({ example: 'Fechamento normal', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}
