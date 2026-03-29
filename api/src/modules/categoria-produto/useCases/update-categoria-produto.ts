import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateCategoriaProdutoDto } from '../dto/update-categoria-produto.dto';

export class UpdateCategoriaProdutoCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateCategoriaProdutoDto, userId: string) {
    const categoria = await this.prisma.categoria_produto.findFirst({
      where: { id, ativo: true },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (dto.nome && dto.nome !== categoria.nome) {
      const duplicado = await this.prisma.categoria_produto.findFirst({
        where: { nome: dto.nome, ativo: true },
      });
      if (duplicado) {
        throw new BadRequestException('Já existe uma categoria com este nome.');
      }
    }

    const atualizado = await this.prisma.categoria_produto.update({
      where: { id },
      data: {
        ...dto,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
    });

    return new ResponseMessage('Categoria atualizada com sucesso', atualizado);
  }
}
