import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { STATUS_VENDA } from 'src/common/constants/venda';

export class RelatorioLucratividadeCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { data_inicio?: string; data_fim?: string }) {
    const { data_inicio, data_fim } = params;

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

    const itens = await this.prisma.item_venda.findMany({
      where: { venda: whereVenda },
      select: {
        quantidade: true,
        preco_unitario: true,
        subtotal: true,
        produto: {
          select: { id: true, nome: true, unidade: true, preco_custo: true },
        },
      },
    });

    // Agrupa por produto
    const agrupado: Record<string, {
      produto_id: string;
      nome: string;
      unidade: string;
      quantidade: number;
      receita: number;
      custo_total: number | null;
      lucro_bruto: number | null;
      margem_percentual: number | null;
      tem_custo: boolean;
    }> = {};

    for (const item of itens) {
      const pid = item.produto.id;
      if (!agrupado[pid]) {
        agrupado[pid] = {
          produto_id: pid,
          nome: item.produto.nome,
          unidade: item.produto.unidade,
          quantidade: 0,
          receita: 0,
          custo_total: item.produto.preco_custo ? 0 : null,
          lucro_bruto: item.produto.preco_custo ? 0 : null,
          margem_percentual: null,
          tem_custo: !!item.produto.preco_custo,
        };
      }
      agrupado[pid].quantidade += item.quantidade;
      agrupado[pid].receita += Number(item.subtotal);

      if (item.produto.preco_custo) {
        const custo = Number(item.produto.preco_custo) * item.quantidade;
        agrupado[pid].custo_total = (agrupado[pid].custo_total ?? 0) + custo;
        agrupado[pid].lucro_bruto = (agrupado[pid].lucro_bruto ?? 0) + (Number(item.subtotal) - custo);
      }
    }

    const produtos = Object.values(agrupado).map((p) => ({
      ...p,
      margem_percentual:
        p.custo_total && p.custo_total > 0
          ? Math.round(((p.receita - p.custo_total) / p.custo_total) * 10000) / 100
          : null,
    })).sort((a, b) => b.receita - a.receita);

    const receita_total = produtos.reduce((acc, p) => acc + p.receita, 0);
    const custo_total = produtos.reduce((acc, p) => acc + (p.custo_total ?? 0), 0);
    const lucro_bruto = receita_total - custo_total;
    const margem_geral =
      custo_total > 0
        ? Math.round(((receita_total - custo_total) / custo_total) * 10000) / 100
        : null;

    const produtos_sem_custo = produtos.filter((p) => !p.tem_custo).length;

    return new ResponseMessage('Sucesso', {
      periodo: { data_inicio, data_fim },
      resumo: {
        receita_total,
        custo_total,
        lucro_bruto,
        margem_geral_percentual: margem_geral,
        produtos_sem_custo_cadastrado: produtos_sem_custo,
        aviso: produtos_sem_custo > 0
          ? `${produtos_sem_custo} produto(s) sem preço de custo — lucro pode estar subestimado.`
          : null,
      },
      produtos,
    });
  }
}
