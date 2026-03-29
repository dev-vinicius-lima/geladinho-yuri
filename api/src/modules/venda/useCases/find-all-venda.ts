import { PrismaService } from 'src/database/prisma.service';
import { ResponsePagination } from 'src/common/message/response-pagination';

export class FindAllVendaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    page: number;
    pageSize: number;
    status?: string;
    forma_pagamento?: string;
    data_inicio?: string;
    data_fim?: string;
    caixa_id?: string;
  }) {
    const { page, pageSize, status, forma_pagamento, data_inicio, data_fim, caixa_id } = params;
    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (status) where.status = status;
    if (forma_pagamento) where.forma_pagamento = forma_pagamento;
    if (caixa_id) where.caixa_id = caixa_id;
    if (data_inicio || data_fim) {
      where.criado_em = {};
      if (data_inicio) where.criado_em.gte = new Date(data_inicio);
      if (data_fim) {
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        where.criado_em.lte = fim;
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.venda.findMany({
        where,
        take,
        skip,
        orderBy: { criado_em: 'desc' },
        select: {
          id: true,
          total: true,
          desconto: true,
          forma_pagamento: true,
          status: true,
          criado_em: true,
          troco: true,
          usuario: { select: { id: true, apelido: true } },
          _count: { select: { itens: true } },
        },
      }),
      this.prisma.venda.count({ where }),
    ]);

    // Totalizador para a página inteira
    const totalGeral = await this.prisma.venda.aggregate({
      where: { ...where, status: 'concluida' },
      _sum: { total: true },
    });

    return new ResponsePagination({
      message: 'Sucesso',
      data,
      take,
      page: pageNum,
      totalItems: total,
      informacoes_extras: {
        total_periodo: Number(totalGeral._sum.total ?? 0),
      },
    });
  }
}
