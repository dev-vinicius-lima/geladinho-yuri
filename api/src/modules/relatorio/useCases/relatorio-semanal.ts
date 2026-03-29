import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { STATUS_VENDA } from 'src/common/constants/venda';

export class RelatorioSemanalCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dataRef?: string) {
    // Se não informada, usa a semana atual (últimos 7 dias)
    const fim = dataRef ? new Date(dataRef) : new Date();
    fim.setHours(23, 59, 59, 999);

    const inicio = new Date(fim);
    inicio.setDate(fim.getDate() - 6);
    inicio.setHours(0, 0, 0, 0);

    const vendas = await this.prisma.venda.findMany({
      where: {
        status: STATUS_VENDA.CONCLUIDA,
        criado_em: { gte: inicio, lte: fim },
      },
      select: {
        total: true,
        criado_em: true,
        forma_pagamento: true,
      },
    });

    // Agrupa por dia da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const agrupado: Record<string, { data: string; dia: string; total: number; quantidade: number }> = {};

    // Inicializa todos os 7 dias com zero
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const chave = d.toISOString().split('T')[0];
      agrupado[chave] = {
        data: chave,
        dia: diasSemana[d.getDay()],
        total: 0,
        quantidade: 0,
      };
    }

    for (const venda of vendas) {
      const chave = venda.criado_em.toISOString().split('T')[0];
      if (agrupado[chave]) {
        agrupado[chave].total += Number(venda.total);
        agrupado[chave].quantidade += 1;
      }
    }

    const dados = Object.values(agrupado);
    const totalGeral = dados.reduce((acc, d) => acc + d.total, 0);
    const totalVendas = dados.reduce((acc, d) => acc + d.quantidade, 0);

    return new ResponseMessage('Sucesso', {
      periodo: { inicio: inicio.toISOString().split('T')[0], fim: fim.toISOString().split('T')[0] },
      dias: dados,
      resumo: { total: totalGeral, quantidade: totalVendas },
    });
  }
}
