import { PrismaService } from 'src/database/prisma.service';
import { ResponsePagination } from 'src/common/message/response-pagination';

class FindAllNotificacaoCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { userId: string; page: number; pageSize: number }) {
    const { userId, page, pageSize } = params;
    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const where = { usuario_id: userId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notificacao.findMany({
        where,
        take,
        skip,
        orderBy: [{ lida: 'asc' }, { criado_em: 'desc' }],
      }),
      this.prisma.notificacao.count({ where }),
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

export { FindAllNotificacaoCase };
