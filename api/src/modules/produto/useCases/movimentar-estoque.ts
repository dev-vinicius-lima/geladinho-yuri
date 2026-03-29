import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { TIPO_MOVIMENTACAO_ESTOQUE } from 'src/common/constants/estoque';
import { MovimentacaoEstoqueDto } from '../dto/movimentacao-estoque.dto';

export class MovimentarEstoqueCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(produtoId: string, dto: MovimentacaoEstoqueDto, userId: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id: produtoId, ativo: true },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado.');

    const novaQuantidade = this.calcularNovaQuantidade(
      produto.quantidade,
      dto.tipo,
      dto.quantidade,
    );

    if (novaQuantidade < 0) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${produto.quantidade}, solicitado: ${dto.quantidade}.`,
      );
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      await tx.produto.update({
        where: { id: produtoId },
        data: { quantidade: novaQuantidade, atualizado_em: new Date() },
      });

      return tx.movimentacao_estoque.create({
        data: {
          produto_id: produtoId,
          tipo: dto.tipo,
          quantidade: dto.quantidade,
          descricao: dto.descricao,
          criado_por: userId,
        },
      });
    });

    return new ResponseMessage('Movimentação registrada com sucesso', {
      ...resultado,
      quantidade_anterior: produto.quantidade,
      quantidade_atual: novaQuantidade,
    });
  }

  private calcularNovaQuantidade(atual: number, tipo: string, qtd: number): number {
    switch (tipo) {
      case TIPO_MOVIMENTACAO_ESTOQUE.ENTRADA:
        return atual + qtd;
      case TIPO_MOVIMENTACAO_ESTOQUE.SAIDA:
        return atual - qtd;
      case TIPO_MOVIMENTACAO_ESTOQUE.AJUSTE:
        return qtd; // ajuste = definir o estoque absoluto
      default:
        return atual;
    }
  }
}
