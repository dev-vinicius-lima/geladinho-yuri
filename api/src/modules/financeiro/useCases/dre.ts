import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';

class DreCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { data_inicio?: string; data_fim?: string }) {
    const { data_inicio, data_fim } = params;

    if (!data_inicio || !data_fim) {
      throw new BadRequestException('data_inicio e data_fim são obrigatórios.');
    }

    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    fim.setHours(23, 59, 59, 999);

    // 1. Receita de vendas concluídas no período
    const vendasAggregate = await this.prisma.venda.aggregate({
      where: {
        status: 'concluida',
        criado_em: { gte: inicio, lte: fim },
      },
      _sum: { total: true },
    });
    const receitaVendas = Number(vendasAggregate._sum.total ?? 0);

    // 2. Custo de mercadoria vendida (entradas de estoque confirmadas no período)
    const entradaEstoqueAggregate = await this.prisma.entrada_estoque.aggregate({
      where: {
        status: 'confirmada',
        criado_em: { gte: inicio, lte: fim },
      },
      _sum: { total: true },
    });
    const custoMercadoria = Number(entradaEstoqueAggregate._sum.total ?? 0);

    // 3. Despesas operacionais — contas pagas do tipo "pagar" agrupadas por categoria
    const contasPagas = await this.prisma.conta_financeira.findMany({
      where: {
        ativo: true,
        tipo: 'pagar',
        pago_em: { gte: inicio, lte: fim },
      },
      include: {
        categoria: { select: { id: true, nome: true } },
      },
    });

    // Agrupar despesas por categoria
    const despesasPorCategoria = new Map<string, { categoria: string; total: number }>();

    for (const conta of contasPagas) {
      const catNome = conta.categoria?.nome ?? 'Sem categoria';
      const catId = conta.categoria?.id ?? 'sem_categoria';
      const existing = despesasPorCategoria.get(catId);

      if (existing) {
        existing.total += Number(conta.valor);
      } else {
        despesasPorCategoria.set(catId, {
          categoria: catNome,
          total: Number(conta.valor),
        });
      }
    }

    const despesasOperacionais = Array.from(despesasPorCategoria.values()).map((d) => ({
      categoria: d.categoria,
      total: Number(d.total.toFixed(2)),
    }));

    const totalDespesasOperacionais = despesasOperacionais.reduce(
      (sum, d) => sum + d.total,
      0,
    );

    // 4. Cálculos
    const lucroBruto = receitaVendas - custoMercadoria;
    const lucroLiquido = lucroBruto - totalDespesasOperacionais;

    return new ResponseMessage('Sucesso', {
      periodo: { data_inicio, data_fim },
      receita_vendas: Number(receitaVendas.toFixed(2)),
      custo_mercadoria: Number(custoMercadoria.toFixed(2)),
      lucro_bruto: Number(lucroBruto.toFixed(2)),
      despesas_operacionais: despesasOperacionais,
      total_despesas_operacionais: Number(totalDespesasOperacionais.toFixed(2)),
      lucro_liquido: Number(lucroLiquido.toFixed(2)),
    });
  }
}

export { DreCase };
