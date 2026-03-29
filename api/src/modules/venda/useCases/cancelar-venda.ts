import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { STATUS_CAIXA } from 'src/common/constants/caixa';
import { STATUS_VENDA } from 'src/common/constants/venda';
import { TIPO_MOVIMENTACAO_ESTOQUE } from 'src/common/constants/estoque';

export class CancelarVendaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(vendaId: string, usuarioId: string) {
    const venda = await this.prisma.venda.findFirst({
      where: { id: vendaId },
      include: {
        itens: true,
        caixa: true,
      },
    });

    if (!venda) throw new NotFoundException('Venda não encontrada.');

    if (venda.status === STATUS_VENDA.CANCELADA) {
      throw new BadRequestException('Esta venda já foi cancelada.');
    }

    // Não permite cancelar venda de caixa já fechado
    if (venda.caixa && venda.caixa.status === STATUS_CAIXA.FECHADO) {
      throw new BadRequestException('Não é possível cancelar uma venda de um caixa já fechado.');
    }

    // Estorna estoque e cancela a venda
    await this.prisma.$transaction(async (tx) => {
      await tx.venda.update({
        where: { id: vendaId },
        data: {
          status: STATUS_VENDA.CANCELADA,
          atualizado_em: new Date(),
        },
      });

      for (const item of venda.itens) {
        await tx.produto.update({
          where: { id: item.produto_id },
          data: { quantidade: { increment: item.quantidade } },
        });

        await tx.movimentacao_estoque.create({
          data: {
            produto_id: item.produto_id,
            venda_id: vendaId,
            tipo: TIPO_MOVIMENTACAO_ESTOQUE.CANCELAMENTO,
            quantidade: item.quantidade,
            descricao: `Cancelamento de venda #${vendaId.slice(-6).toUpperCase()}`,
            criado_por: usuarioId,
          },
        });
      }
    });

    return new ResponseMessage('Venda cancelada e estoque estornado com sucesso', { id: vendaId });
  }
}
