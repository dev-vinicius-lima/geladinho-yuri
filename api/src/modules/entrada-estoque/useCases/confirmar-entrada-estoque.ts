import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { TIPO_MOVIMENTACAO_ESTOQUE } from 'src/common/constants/estoque';

class ConfirmarEntradaEstoqueCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(entradaId: string, userId: string) {
    const entrada = await this.prisma.entrada_estoque.findFirst({
      where: { id: entradaId },
      include: { itens: true },
    });

    if (!entrada) {
      throw new NotFoundException('Entrada de estoque não encontrada.');
    }

    if (entrada.status !== 'rascunho') {
      throw new BadRequestException(
        `Apenas entradas com status "rascunho" podem ser confirmadas. Status atual: "${entrada.status}".`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Atualiza status para confirmada
      await tx.entrada_estoque.update({
        where: { id: entradaId },
        data: {
          status: 'confirmada',
          atualizado_por: userId,
          atualizado_em: new Date(),
        },
      });

      // Para cada item: incrementa estoque, atualiza preco_custo e cria movimentação
      for (const item of entrada.itens) {
        await tx.produto.update({
          where: { id: item.produto_id },
          data: {
            quantidade: { increment: item.quantidade },
            preco_custo: item.preco_unitario,
          },
        });

        await tx.movimentacao_estoque.create({
          data: {
            produto_id: item.produto_id,
            tipo: TIPO_MOVIMENTACAO_ESTOQUE.ENTRADA,
            quantidade: item.quantidade,
            descricao: `Entrada de estoque #${entradaId.slice(-6).toUpperCase()}`,
            criado_por: userId,
          },
        });
      }
    });

    return new ResponseMessage('Entrada de estoque confirmada com sucesso', { id: entradaId });
  }
}

export { ConfirmarEntradaEstoqueCase };
