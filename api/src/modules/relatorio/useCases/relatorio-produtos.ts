import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { STATUS_VENDA } from 'src/common/constants/venda';

export class RelatorioProdutosCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    data_inicio?: string;
    data_fim?: string;
    top?: number;
  }) {
    const { data_inicio, data_fim, top = 10 } = params;

    const whereVenda: any = { status: STATUS_VENDA.CONCLUIDA };
    if (data_inicio || data_fim) {
      whereVenda.criado_em = {};
      if (data_inicio) whereVenda.criado_em.gte = new Date(data_inicio);
      if (data_fim) {
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        whereVenda.criado_em.lte = fim;
      }
    }

    // Busca itens de vendas no período
    const itens = await this.prisma.item_venda.findMany({
      where: { venda: whereVenda },
      select: {
        quantidade: true,
        subtotal: true,
        produto: { select: { id: true, nome: true, unidade: true } },
      },
    });

    // Agrupa por produto
    const agrupado: Record<
      string,
      { produto_id: string; nome: string; unidade: string; quantidade: number; receita: number; ocorrencias: number }
    > = {};

    for (const item of itens) {
      const id = item.produto.id;
      if (!agrupado[id]) {
        agrupado[id] = {
          produto_id: id,
          nome: item.produto.nome,
          unidade: item.produto.unidade,
          quantidade: 0,
          receita: 0,
          ocorrencias: 0,
        };
      }
      agrupado[id].quantidade += item.quantidade;
      agrupado[id].receita += Number(item.subtotal);
      agrupado[id].ocorrencias += 1;
    }

    // Ordena por quantidade vendida (top sellers) e limita
    const rankingQtd = Object.values(agrupado)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, top);

    const rankingReceita = Object.values(agrupado)
      .sort((a, b) => b.receita - a.receita)
      .slice(0, top);

    return new ResponseMessage('Sucesso', {
      periodo: { data_inicio, data_fim },
      top_por_quantidade: rankingQtd,
      top_por_receita: rankingReceita,
    });
  }
}
