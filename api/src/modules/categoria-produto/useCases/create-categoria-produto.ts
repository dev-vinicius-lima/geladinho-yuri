import { BadRequestException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCategoriaProdutoDto } from '../dto/create-categoria-produto.dto';

export class CreateCategoriaProdutoCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateCategoriaProdutoDto, userId: string) {
    const existente = await this.prisma.categoria_produto.findFirst({
      where: { nome: dto.nome, ativo: true },
    });

    if (existente) {
      throw new BadRequestException('Já existe uma categoria com este nome.');
    }

    const categoria = await this.prisma.categoria_produto.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        criado_por: userId,
      },
    });

    return new ResponseMessage('Categoria criada com sucesso', categoria);
  }
}
