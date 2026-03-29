import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { TIPO_MOVIMENTACAO_ESTOQUE } from 'src/common/constants/estoque';

class CancelarEntradaEstoqueCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(entradaId: string, userId: string) {
    const entrada = await this.prisma.entrada_estoque.findFirst({
      where: { id: entradaId },
      include: { itens: true },
    });

    if (!entrada) {
      throw new NotFoundException('Entrada de estoque não encontrada.');
    }

    if (entrada.status !== 'confirmada') {
      throw new BadRequestException(
        `Apenas entradas com status "confirmada" podem ser canceladas. Status atual: "${entrada.status}".`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Atualiza status para cancelada
      await tx.entrada_estoque.update({
        where: { id: entradaId },
        data: {
          status: 'cancelada',
          atualizado_por: userId,
          atualizado_em: new Date(),
        },
      });

      // Para cada item: decrementa estoque e cria movimentação de saída
      for (const item of entrada.itens) {
        await tx.produto.update({
          where: { id: item.produto_id },
          data: {
            quantidade: { decrement: item.quantidade },
          },
        });

        await tx.movimentacao_estoque.create({
          data: {
            produto_id: item.produto_id,
            tipo: TIPO_MOVIMENTACAO_ESTOQUE.SAIDA,
            quantidade: item.quantidade,
            descricao: 'Cancelamento de entrada de estoque',
            criado_por: userId,
          },
        });
      }
    });

    return new ResponseMessage('Entrada de estoque cancelada e estoque estornado com sucesso', { id: entradaId });
  }
}

export { CancelarEntradaEstoqueCase };
