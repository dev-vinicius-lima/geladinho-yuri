import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { STATUS_CAIXA } from 'src/common/constants/caixa';
import { STATUS_VENDA } from 'src/common/constants/venda';

export class GetDashboardCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: string) {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    // Caixa atual do operador
    const caixaAberto = await this.prisma.caixa.findFirst({
      where: { usuario_id: usuarioId, status: STATUS_CAIXA.ABERTO },
      select: { id: true, valor_abertura: true, aberto_em: true },
    });

    // Vendas do dia (apenas concluídas)
    const vendasHoje = await this.prisma.venda.findMany({
      where: {
        status: STATUS_VENDA.CONCLUIDA,
        criado_em: { gte: inicioDoDia },
        ...(caixaAberto ? { caixa_id: caixaAberto.id } : {}),
      },
      select: {
        total: true,
        forma_pagamento: true,
      },
    });

    const totalVendas = vendasHoje.reduce((acc, v) => acc + Number(v.total), 0);
    const quantidadePedidos = vendasHoje.length;
    const ticketMedio = quantidadePedidos > 0 ? totalVendas / quantidadePedidos : 0;

    // Breakdown por forma de pagamento
    const porFormaPagamento = vendasHoje.reduce<Record<string, number>>((acc, v) => {
      acc[v.forma_pagamento] = (acc[v.forma_pagamento] ?? 0) + Number(v.total);
      return acc;
    }, {});

    // Produtos com estoque crítico (abaixo do mínimo)
    const estoqueCriticoCount = await this.prisma.produto.count({
      where: { ativo: true },
    }).then(async () => {
      const todos = await this.prisma.produto.findMany({
        where: { ativo: true },
        select: { quantidade: true, estoque_minimo: true },
      });
      return todos.filter((p) => p.quantidade <= p.estoque_minimo).length;
    });

    return new ResponseMessage('Sucesso', {
      caixa_aberto: caixaAberto ?? null,
      vendas_hoje: {
        total: totalVendas,
        quantidade: quantidadePedidos,
        ticket_medio: ticketMedio,
        por_forma_pagamento: porFormaPagamento,
      },
      estoque_critico_count: estoqueCriticoCount,
    });
  }
}
