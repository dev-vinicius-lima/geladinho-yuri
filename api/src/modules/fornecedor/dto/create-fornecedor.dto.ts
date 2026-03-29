import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFornecedorDto {
  @ApiProperty({ example: 'Distribuidora ABC', description: 'Nome do fornecedor' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nome: string;

  @ApiProperty({ example: '12345678000190', description: 'CNPJ (somente numeros)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(14)
  cnpj?: string;

  @ApiProperty({ example: '11999998888', description: 'Telefone de contato', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiProperty({ example: 'contato@abc.com.br', description: 'E-mail de contato', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ example: 'Rua das Flores, 123', description: 'Endereco completo', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  endereco?: string;

  @ApiProperty({ example: 'Entrega somente as quartas', description: 'Observacoes adicionais', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}
