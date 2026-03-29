import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';

class ResumoFinanceiroCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const now = new Date();
    const em30dias = new Date();
    em30dias.setDate(em30dias.getDate() + 30);

    const baseWhere = {
      ativo: true,
      vencimento: { gte: now, lte: em30dias },
    };

    // Total a receber nos próximos 30 dias
    const totalReceber = await this.prisma.conta_financeira.aggregate({
      where: { ...baseWhere, tipo: 'receber', pago_em: null },
      _sum: { valor: true },
    });

    // Total a pagar nos próximos 30 dias
    const totalPagar = await this.prisma.conta_financeira.aggregate({
      where: { ...baseWhere, tipo: 'pagar', pago_em: null },
      _sum: { valor: true },
    });

    // Contas vencidas (não pagas com vencimento anterior a agora)
    const contasVencidas = await this.prisma.conta_financeira.count({
      where: {
        ativo: true,
        pago_em: null,
        vencimento: { lt: now },
      },
    });

    const totalAReceber = Number(totalReceber._sum.valor ?? 0);
    const totalAPagar = Number(totalPagar._sum.valor ?? 0);

    return new ResponseMessage('Sucesso', {
      total_a_receber: totalAReceber,
      total_a_pagar: totalAPagar,
      saldo_projetado: totalAReceber - totalAPagar,
      contas_vencidas_count: contasVencidas,
    });
  }
}

export { ResumoFinanceiroCase };
