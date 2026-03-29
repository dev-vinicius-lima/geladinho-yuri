import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';

export class RelatorioEstoqueCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { categoria_id?: string; apenas_critico?: boolean }) {
    const { categoria_id, apenas_critico } = params;

    const where: any = { ativo: true };
    if (categoria_id) where.categoria_id = categoria_id;

    const produtos = await this.prisma.produto.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { categoria: { select: { id: true, nome: true } } },
    });

    const filtrados = apenas_critico
      ? produtos.filter((p) => p.quantidade <= p.estoque_minimo)
      : produtos;

    const itens = filtrados.map((p) => {
      const valor_custo = p.preco_custo ? Number(p.preco_custo) * p.quantidade : null;
      const valor_venda = Number(p.preco) * p.quantidade;
      const margem_percentual =
        p.preco_custo && Number(p.preco_custo) > 0
          ? ((Number(p.preco) - Number(p.preco_custo)) / Number(p.preco_custo)) * 100
          : null;

      return {
        id: p.id,
        nome: p.nome,
        codigo: p.codigo,
        unidade: p.unidade,
        categoria: p.categoria,
        quantidade: p.quantidade,
        estoque_minimo: p.estoque_minimo,
        estoque_critico: p.quantidade <= p.estoque_minimo,
        preco_custo: p.preco_custo ? Number(p.preco_custo) : null,
        preco_venda: Number(p.preco),
        margem_percentual: margem_percentual ? Math.round(margem_percentual * 100) / 100 : null,
        valor_em_custo: valor_custo,
        valor_em_venda: valor_venda,
      };
    });

    const totais = {
      total_itens: itens.length,
      total_valor_custo: itens.reduce((acc, i) => acc + (i.valor_em_custo ?? 0), 0),
      total_valor_venda: itens.reduce((acc, i) => acc + i.valor_em_venda, 0),
      total_criticos: itens.filter((i) => i.estoque_critico).length,
    };

    return new ResponseMessage('Sucesso', { totais, produtos: itens });
  }
}
