import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { STATUS_VENDA } from 'src/common/constants/venda';
import { TIPO_MOVIMENTACAO_CAIXA } from 'src/common/constants/caixa';

export class RelatorioCaixaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(caixaId: string) {
    const caixa = await this.prisma.caixa.findUnique({
      where: { id: caixaId },
      include: {
        usuario: { select: { id: true, nome: true, apelido: true } },
        movimentacoes: { orderBy: { criado_em: 'asc' } },
      },
    });

    if (!caixa) throw new NotFoundException('Caixa não encontrado.');

    // Vendas do caixa
    const vendas = await this.prisma.venda.findMany({
      where: { caixa_id: caixaId, status: STATUS_VENDA.CONCLUIDA },
      select: { forma_pagamento: true, total: true },
    });

    // Agrupamento por forma de pagamento
    const por_forma_pagamento: Record<string, { quantidade: number; total: number }> = {};
    for (const v of vendas) {
      if (!por_forma_pagamento[v.forma_pagamento]) {
        por_forma_pagamento[v.forma_pagamento] = { quantidade: 0, total: 0 };
      }
      por_forma_pagamento[v.forma_pagamento].quantidade += 1;
      por_forma_pagamento[v.forma_pagamento].total += Number(v.total);
    }

    const total_vendas = vendas.reduce((acc, v) => acc + Number(v.total), 0);

    const sangrias = caixa.movimentacoes.filter((m) => m.tipo === TIPO_MOVIMENTACAO_CAIXA.SANGRIA);
    const suprimentos = caixa.movimentacoes.filter((m) => m.tipo === TIPO_MOVIMENTACAO_CAIXA.SUPRIMENTO);

    const total_sangrias = sangrias.reduce((acc, m) => acc + Number(m.valor), 0);
    const total_suprimentos = suprimentos.reduce((acc, m) => acc + Number(m.valor), 0);

    return new ResponseMessage('Sucesso', {
      caixa: {
        id: caixa.id,
        status: caixa.status,
        operador: caixa.usuario,
        valor_abertura: Number(caixa.valor_abertura),
        valor_fechamento: caixa.valor_fechamento ? Number(caixa.valor_fechamento) : null,
        saldo_esperado: caixa.saldo_esperado ? Number(caixa.saldo_esperado) : null,
        diferenca: caixa.diferenca ? Number(caixa.diferenca) : null,
        aberto_em: caixa.aberto_em,
        fechado_em: caixa.fechado_em,
        observacao: caixa.observacao,
      },
      vendas: {
        quantidade: vendas.length,
        total: total_vendas,
        por_forma_pagamento,
      },
      movimentacoes: {
        sangrias: sangrias.map((s) => ({ valor: Number(s.valor), descricao: s.descricao, criado_em: s.criado_em })),
        suprimentos: suprimentos.map((s) => ({ valor: Number(s.valor), descricao: s.descricao, criado_em: s.criado_em })),
        total_sangrias,
        total_suprimentos,
      },
    });
  }
}
