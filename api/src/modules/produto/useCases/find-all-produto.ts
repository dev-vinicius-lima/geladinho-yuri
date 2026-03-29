import { PrismaService } from 'src/database/prisma.service';
import { ResponsePagination } from 'src/common/message/response-pagination';

export class FindAllProdutoCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    search?: string;
    categoria_id?: string;
    page: number;
    pageSize: number;
    estoque_critico?: boolean; // somente produtos abaixo do mínimo
  }) {
    const { search, categoria_id, page, pageSize, estoque_critico } = params;
    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const where: any = { ativo: true };
    if (search) where.nome = { contains: search, mode: 'insensitive' };
    if (categoria_id) where.categoria_id = categoria_id;

    // Prisma não suporta filtragem de campo vs campo diretamente,
    // então estoque_critico é tratado com rawQuery ou pós-filtro.
    // Aqui usamos pós-filtro simples para não quebrar a paginação.
    // Para volumes grandes, usar $queryRaw.
    let data: any[];
    let total: number;

    if (estoque_critico) {
      // Busca todos ativos que tenham quantidade <= estoque_minimo
      const todos = await this.prisma.produto.findMany({
        where,
        orderBy: { nome: 'asc' },
        include: { categoria: { select: { id: true, nome: true } } },
      });
      const criticos = todos.filter((p) => p.quantidade <= p.estoque_minimo);
      total = criticos.length;
      data = criticos.slice(skip, skip + take);
    } else {
      [data, total] = await this.prisma.$transaction([
        this.prisma.produto.findMany({
          where,
          take,
          skip,
          orderBy: { nome: 'asc' },
          include: { categoria: { select: { id: true, nome: true } } },
        }),
        this.prisma.produto.count({ where }),
      ]);
    }

    return new ResponsePagination({
      message: 'Sucesso',
      data,
      take,
      page: pageNum,
      totalItems: total,
    });
  }
}
