import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { STATUS_VENDA } from 'src/common/constants/venda';

export class RelatorioOperadorCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { data_inicio?: string; data_fim?: string; operador_id?: string }) {
    const { data_inicio, data_fim, operador_id } = params;

    const whereVenda: any = {};
    if (data_inicio || data_fim) {
      whereVenda.criado_em = {};
      if (data_inicio) whereVenda.criado_em.gte = new Date(data_inicio);
      if (data_fim) {
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        whereVenda.criado_em.lte = fim;
      }
    }
    if (operador_id) whereVenda.usuario_id = operador_id;

    const vendas = await this.prisma.venda.findMany({
      where: whereVenda,
      select: {
        total: true,
        status: true,
        usuario_id: true,
        usuario: { select: { id: true, nome: true, apelido: true } },
      },
    });

    // Agrupa por operador
    const agrupado: Record<string, {
      operador: { id: string; nome: string | null; apelido: string | null };
      total_vendas: number;
      qtd_concluidas: number;
      qtd_canceladas: number;
      receita: number;
      ticket_medio: number;
    }> = {};

    for (const v of vendas) {
      const uid = v.usuario_id;
      if (!agrupado[uid]) {
        agrupado[uid] = {
          operador: v.usuario,
          total_vendas: 0,
          qtd_concluidas: 0,
          qtd_canceladas: 0,
          receita: 0,
          ticket_medio: 0,
        };
      }
      agrupado[uid].total_vendas += 1;
      if (v.status === STATUS_VENDA.CONCLUIDA) {
        agrupado[uid].qtd_concluidas += 1;
        agrupado[uid].receita += Number(v.total);
      } else {
        agrupado[uid].qtd_canceladas += 1;
      }
    }

    const resultado = Object.values(agrupado).map((op) => ({
      ...op,
      ticket_medio: op.qtd_concluidas > 0 ? op.receita / op.qtd_concluidas : 0,
    })).sort((a, b) => b.receita - a.receita);

    return new ResponseMessage('Sucesso', {
      periodo: { data_inicio, data_fim },
      operadores: resultado,
    });
  }
}
