import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { STATUS_VENDA } from 'src/common/constants/venda';

export class RelatorioMensalCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(mes?: string) {
    // mes no formato YYYY-MM, ex: 2025-03
    const hoje = new Date();
    const ano = mes ? parseInt(mes.split('-')[0]) : hoje.getFullYear();
    const mesNum = mes ? parseInt(mes.split('-')[1]) - 1 : hoje.getMonth();

    const inicio = new Date(ano, mesNum, 1, 0, 0, 0, 0);
    const fim = new Date(ano, mesNum + 1, 0, 23, 59, 59, 999); // último dia do mês

    const vendas = await this.prisma.venda.findMany({
      where: {
        status: STATUS_VENDA.CONCLUIDA,
        criado_em: { gte: inicio, lte: fim },
      },
      select: { total: true, criado_em: true, forma_pagamento: true },
    });

    // Agrupa por dia do mês
    const diasNoMes = fim.getDate();
    const agrupado: Record<number, { dia: number; total: number; quantidade: number }> = {};

    for (let d = 1; d <= diasNoMes; d++) {
      agrupado[d] = { dia: d, total: 0, quantidade: 0 };
    }

    for (const venda of vendas) {
      const dia = venda.criado_em.getDate();
      agrupado[dia].total += Number(venda.total);
      agrupado[dia].quantidade += 1;
    }

    // Por forma de pagamento
    const porFormaPagamento = vendas.reduce<Record<string, number>>((acc, v) => {
      acc[v.forma_pagamento] = (acc[v.forma_pagamento] ?? 0) + Number(v.total);
      return acc;
    }, {});

    const dados = Object.values(agrupado);
    const totalGeral = dados.reduce((acc, d) => acc + d.total, 0);
    const totalVendas = dados.reduce((acc, d) => acc + d.quantidade, 0);
    const ticketMedio = totalVendas > 0 ? totalGeral / totalVendas : 0;

    return new ResponseMessage('Sucesso', {
      periodo: {
        mes: `${String(mesNum + 1).padStart(2, '0')}/${ano}`,
        inicio: inicio.toISOString().split('T')[0],
        fim: fim.toISOString().split('T')[0],
      },
      dias: dados,
      por_forma_pagamento: porFormaPagamento,
      resumo: { total: totalGeral, quantidade: totalVendas, ticket_medio: ticketMedio },
    });
  }
}
