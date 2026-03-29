import { PrismaService } from 'src/database/prisma.service';
import { ResponsePagination } from 'src/common/message/response-pagination';

class FindAllEntradaEstoqueCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    page: number;
    pageSize: number;
    fornecedor_id?: string;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  }) {
    const { page, pageSize, fornecedor_id, status, data_inicio, data_fim } = params;
    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (fornecedor_id) where.fornecedor_id = fornecedor_id;
    if (status) where.status = status;
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
      this.prisma.entrada_estoque.findMany({
        where,
        take,
        skip,
        orderBy: { criado_em: 'desc' },
        include: {
          fornecedor: { select: { id: true, nome: true } },
          _count: { select: { itens: true } },
        },
      }),
      this.prisma.entrada_estoque.count({ where }),
    ]);

    return new ResponsePagination({
      message: 'Sucesso',
      data,
      take,
      page: pageNum,
      totalItems: total,
    });
  }
}

export { FindAllEntradaEstoqueCase };
