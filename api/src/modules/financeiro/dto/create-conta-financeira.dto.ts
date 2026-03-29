import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContaFinanceiraDto {
  @ApiProperty({
    example: 'pagar',
    description: 'Tipo da conta',
    enum: ['pagar', 'receber'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pagar', 'receber'], { message: 'tipo deve ser "pagar" ou "receber"' })
  tipo: string;

  @ApiProperty({ example: 'Conta de energia elétrica', description: 'Descrição da conta' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descricao: string;

  @ApiProperty({ example: 150.00, description: 'Valor da conta' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  valor: number;

  @ApiProperty({ example: '2026-04-15', description: 'Data de vencimento' })
  @IsDateString({}, { message: 'vencimento deve ser uma data válida (ISO 8601)' })
  @IsNotEmpty()
  vencimento: string;

  @ApiProperty({ example: 'uuid-da-categoria', required: false, description: 'ID da categoria financeira' })
  @IsOptional()
  @IsUUID('4', { message: 'categoria_financeira_id deve ser um UUID válido' })
  categoria_financeira_id?: string;

  @ApiProperty({ example: 'Pagamento mensal recorrente', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;

  @ApiProperty({ example: false, required: false, description: 'Se a conta é recorrente' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  recorrente?: boolean;
}
