import { PrismaService } from 'src/database/prisma.service';
import { ResponsePagination } from 'src/common/message/response-pagination';

class FindAllFornecedorCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { search?: string; page: number; pageSize: number }) {
    const { search, page, pageSize } = params;
    const pageNum = page + 1; // frontend manda 0-based
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const where = {
      ativo: true,
      ...(search && {
        nome: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.fornecedor.findMany({
        where,
        take,
        skip,
        orderBy: { nome: 'asc' },
        include: {
          _count: { select: { entradas_estoque: true } },
        },
      }),
      this.prisma.fornecedor.count({ where }),
    ]);

    return new ResponsePagination({ message: 'Sucesso', data, take, page: pageNum, totalItems: total });
  }
}

export { FindAllFornecedorCase };
