import { PrismaService } from 'src/database/prisma.service';
import { ResponsePagination } from 'src/common/message/response-pagination';

export class FindAllPerfilCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { search?: string; page: number; pageSize: number }) {
    const { search, page, pageSize } = params;
    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const where: any = { ativo: true };
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { identificador: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.perfil.findMany({
        where,
        take,
        skip,
        orderBy: { nome: 'asc' },
        include: {
          _count: { select: { usuario_perfil: true } },
        },
      }),
      this.prisma.perfil.count({ where }),
    ]);

    return new ResponsePagination({ message: 'Sucesso', data, take, page: pageNum, totalItems: total });
  }
}
