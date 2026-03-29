import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class PagarContaDto {
  @ApiProperty({ example: 'pix', description: 'Forma de pagamento utilizada' })
  @IsString()
  @IsNotEmpty({ message: 'forma_pagamento é obrigatória' })
  @MaxLength(30)
  forma_pagamento: string;
}
