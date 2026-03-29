import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateProdutoDto } from '../dto/update-produto.dto';

export class UpdateProdutoCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateProdutoDto, userId: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id, ativo: true },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado.');

    // Verifica nome único na categoria (ignorando o próprio produto)
    const categoriaId = dto.categoria_id ?? produto.categoria_id;
    if (dto.nome && dto.nome !== produto.nome) {
      const duplicado = await this.prisma.produto.findFirst({
        where: { nome: dto.nome, categoria_id: categoriaId, ativo: true },
      });
      if (duplicado) throw new BadRequestException('Já existe um produto com este nome nesta categoria.');
    }

    // Verifica unicidade do código
    if (dto.codigo && dto.codigo !== produto.codigo) {
      const codigoDuplicado = await this.prisma.produto.findFirst({
        where: { codigo: dto.codigo },
      });
      if (codigoDuplicado) throw new BadRequestException('Este código já está em uso.');
    }

    // Não permite alterar a quantidade diretamente via update — use movimentação
    const { quantidade: _qty, ...dadosAtualizar } = dto;

    const atualizado = await this.prisma.produto.update({
      where: { id },
      data: {
        ...dadosAtualizar,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
      include: { categoria: { select: { id: true, nome: true } } },
    });

    return new ResponseMessage('Produto atualizado com sucesso', atualizado);
  }
}
