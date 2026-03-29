import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { STATUS_VENDA } from 'src/common/constants/venda';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export class RelatorioAnualCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(ano?: number) {
    const anoRef = ano ?? new Date().getFullYear();

    const inicio = new Date(anoRef, 0, 1, 0, 0, 0, 0);
    const fim = new Date(anoRef, 11, 31, 23, 59, 59, 999);

    const vendas = await this.prisma.venda.findMany({
      where: {
        status: STATUS_VENDA.CONCLUIDA,
        criado_em: { gte: inicio, lte: fim },
      },
      select: { total: true, criado_em: true, forma_pagamento: true },
    });

    // Agrupa por mês
    const agrupado: Record<number, { mes: number; nome: string; total: number; quantidade: number }> = {};
    for (let m = 0; m < 12; m++) {
      agrupado[m] = { mes: m + 1, nome: MESES[m], total: 0, quantidade: 0 };
    }

    for (const venda of vendas) {
      const mes = venda.criado_em.getMonth();
      agrupado[mes].total += Number(venda.total);
      agrupado[mes].quantidade += 1;
    }

    const porFormaPagamento = vendas.reduce<Record<string, number>>((acc, v) => {
      acc[v.forma_pagamento] = (acc[v.forma_pagamento] ?? 0) + Number(v.total);
      return acc;
    }, {});

    const dados = Object.values(agrupado);
    const totalGeral = dados.reduce((acc, d) => acc + d.total, 0);
    const totalVendas = dados.reduce((acc, d) => acc + d.quantidade, 0);
    const melhorMes = dados.reduce((max, d) => (d.total > max.total ? d : max), dados[0]);

    return new ResponseMessage('Sucesso', {
      ano: anoRef,
      meses: dados,
      por_forma_pagamento: porFormaPagamento,
      resumo: {
        total: totalGeral,
        quantidade: totalVendas,
        ticket_medio: totalVendas > 0 ? totalGeral / totalVendas : 0,
        melhor_mes: melhorMes,
      },
    });
  }
}
