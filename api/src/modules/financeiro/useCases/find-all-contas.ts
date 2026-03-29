import { PrismaService } from 'src/database/prisma.service';
import { ResponsePagination } from 'src/common/message/response-pagination';

class FindAllContasCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    page: number;
    pageSize: number;
    tipo?: string;
    status?: string;
    vencimento_inicio?: string;
    vencimento_fim?: string;
    categoria_financeira_id?: string;
  }) {
    const {
      page,
      pageSize,
      tipo,
      status,
      vencimento_inicio,
      vencimento_fim,
      categoria_financeira_id,
    } = params;

    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;
    const now = new Date();

    const where: any = { ativo: true };

    if (tipo) where.tipo = tipo;
    if (categoria_financeira_id) where.categoria_financeira_id = categoria_financeira_id;

    // Filtro de status: pendente, paga, vencida
    if (status === 'pendente') {
      where.pago_em = null;
      where.vencimento = { gte: now };
    } else if (status === 'paga') {
      where.pago_em = { not: null };
    } else if (status === 'vencida') {
      where.pago_em = null;
      where.vencimento = { lt: now };
    }

    // Filtro de período de vencimento
    if (vencimento_inicio || vencimento_fim) {
      // Se status já definiu where.vencimento, precisamos combinar
      const vencFilter = where.vencimento ?? {};
      if (vencimento_inicio) vencFilter.gte = new Date(vencimento_inicio);
      if (vencimento_fim) {
        const fim = new Date(vencimento_fim);
        fim.setHours(23, 59, 59, 999);
        vencFilter.lte = fim;
      }
      where.vencimento = vencFilter;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.conta_financeira.findMany({
        where,
        take,
        skip,
        orderBy: { vencimento: 'asc' },
        include: {
          categoria: { select: { id: true, nome: true, tipo: true } },
        },
      }),
      this.prisma.conta_financeira.count({ where }),
    ]);

    // Totalizador do período filtrado
    const totais = await this.prisma.conta_financeira.aggregate({
      where,
      _sum: { valor: true },
    });

    return new ResponsePagination({
      message: 'Sucesso',
      data,
      take,
      page: pageNum,
      totalItems: total,
      informacoes_extras: {
        total_valor: Number(totais._sum.valor ?? 0),
      },
    });
  }
}

export { FindAllContasCase };
