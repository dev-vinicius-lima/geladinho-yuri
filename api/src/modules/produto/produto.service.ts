import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { ResponsePagination } from 'src/common/message/response-pagination';
import { ExportHelper, formatBRL, formatPercent } from 'src/common/helpers/export.helper';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { MovimentacaoEstoqueDto } from './dto/movimentacao-estoque.dto';
import { CreateProdutoCase } from './useCases/create-produto';
import { UpdateProdutoCase } from './useCases/update-produto';
import { FindAllProdutoCase } from './useCases/find-all-produto';
import { MovimentarEstoqueCase } from './useCases/movimentar-estoque';

type ExportResult = { buffer: Buffer; contentType: string; filename: string };

@Injectable()
export class ProdutoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProdutoDto, userId: string) {
    return new CreateProdutoCase(this.prisma).execute(dto, userId);
  }

  async findAll(params: {
    search?: string;
    categoria_id?: string;
    page: number;
    pageSize: number;
    estoque_critico?: boolean;
  }) {
    return new FindAllProdutoCase(this.prisma).execute(params);
  }

  async findOne(id: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id, ativo: true },
      include: {
        categoria: { select: { id: true, nome: true } },
        movimentacoes: {
          orderBy: { criado_em: 'desc' },
          take: 10,
        },
      },
    });

    if (!produto) throw new NotFoundException('Produto não encontrado.');

    return new ResponseMessage('Sucesso', produto);
  }

  async update(id: string, dto: UpdateProdutoDto, userId: string) {
    return new UpdateProdutoCase(this.prisma).execute(id, dto, userId);
  }

  async toggleStatus(id: string, userId: string) {
    const produto = await this.prisma.produto.findFirst({ where: { id } });
    if (!produto) throw new NotFoundException('Produto não encontrado.');

    const atualizado = await this.prisma.produto.update({
      where: { id },
      data: {
        ativo: !produto.ativo,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
    });

    const msg = atualizado.ativo ? 'Produto ativado' : 'Produto desativado';
    return new ResponseMessage(msg, atualizado);
  }

  async movimentarEstoque(id: string, dto: MovimentacaoEstoqueDto, userId: string) {
    return new MovimentarEstoqueCase(this.prisma).execute(id, dto, userId);
  }

  async exportar(
    params: { search?: string; categoria_id?: string },
    formato: 'pdf' | 'xlsx' | 'csv',
  ): Promise<ExportResult> {
    const where: any = { ativo: true };
    if (params.search) where.nome = { contains: params.search, mode: 'insensitive' };
    if (params.categoria_id) where.categoria_id = params.categoria_id;

    const produtos = await this.prisma.produto.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { categoria: { select: { nome: true } } },
    });

    const headers = ['Nome', 'Código', 'Categoria', 'Unidade', 'Preço Venda (R$)', 'Preço Custo (R$)', 'Quantidade', 'Est. Mínimo'];
    const rows = produtos.map((p) => [
      p.nome,
      p.codigo ?? '',
      p.categoria?.nome ?? '',
      p.unidade,
      Number(p.preco),
      p.preco_custo ? Number(p.preco_custo) : '',
      p.quantidade,
      p.estoque_minimo,
    ]);

    if (formato === 'xlsx') {
      return {
        buffer: ExportHelper.toXlsx('Produtos', headers, rows),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'catalogo-produtos.xlsx',
      };
    }

    if (formato === 'csv') {
      return {
        buffer: ExportHelper.toCsv(headers, rows),
        contentType: 'text/csv; charset=utf-8',
        filename: 'catalogo-produtos.csv',
      };
    }

    const buffer = await ExportHelper.toPdf('Catálogo de Produtos', [
      {
        title: 'Resumo',
        summary: [
          { label: 'Total de produtos', value: String(produtos.length) },
        ],
      },
      {
        title: 'Produtos',
        table: {
          headers: ['Nome', 'Categoria', 'Un.', 'Preço', 'Custo', 'Qtd', 'Est.Mín'],
          rows: produtos.map((p) => [
            p.nome,
            p.categoria?.nome ?? '',
            p.unidade,
            formatBRL(Number(p.preco)),
            formatBRL(p.preco_custo ? Number(p.preco_custo) : null),
            p.quantidade,
            p.estoque_minimo,
          ]),
        },
      },
    ]);

    return { buffer, contentType: 'application/pdf', filename: 'catalogo-produtos.pdf' };
  }

  async getMovimentacoes(id: string, params: { page: number; pageSize: number }) {
    const { page, pageSize } = params;
    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const produto = await this.prisma.produto.findFirst({
      where: { id, ativo: true },
      select: { id: true, nome: true, quantidade: true },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado.');

    const [data, total] = await this.prisma.$transaction([
      this.prisma.movimentacao_estoque.findMany({
        where: { produto_id: id },
        take,
        skip,
        orderBy: { criado_em: 'desc' },
      }),
      this.prisma.movimentacao_estoque.count({ where: { produto_id: id } }),
    ]);

    return new ResponsePagination({
      message: 'Sucesso',
      data,
      take,
      page: pageNum,
      totalItems: total,
      informacoes_extras: { produto },
    });
  }
}
