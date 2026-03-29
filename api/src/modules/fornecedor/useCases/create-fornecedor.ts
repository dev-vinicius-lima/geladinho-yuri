import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreateFornecedorDto } from '../dto/create-fornecedor.dto';

class CreateFornecedorCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateFornecedorDto, userId: string) {
    // Valida unicidade do CNPJ, se informado
    if (dto.cnpj) {
      const cnpjExistente = await this.prisma.fornecedor.findFirst({
        where: { cnpj: dto.cnpj, ativo: true },
      });

      if (cnpjExistente) {
        throw new BadRequestException('Ja existe um fornecedor com este CNPJ.');
      }
    }

    const fornecedor = await this.prisma.fornecedor.create({
      data: {
        nome: dto.nome,
        cnpj: dto.cnpj,
        telefone: dto.telefone,
        email: dto.email,
        endereco: dto.endereco,
        observacao: dto.observacao,
        criado_por: userId,
      },
    });

    return new ResponseMessage('Fornecedor criado com sucesso', fornecedor);
  }
}

export { CreateFornecedorCase };
