import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreateEntradaEstoqueDto } from '../dto/create-entrada-estoque.dto';

class CreateEntradaEstoqueCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateEntradaEstoqueDto, userId: string) {
    const { fornecedor_id, nota_fiscal, data_emissao, observacao, itens } = dto;

    if (!itens || itens.length === 0) {
      throw new BadRequestException('A entrada deve ter ao menos um item.');
    }

    // Valida fornecedor ativo
    const fornecedor = await this.prisma.fornecedor.findFirst({
      where: { id: fornecedor_id, ativo: true },
    });

    if (!fornecedor) {
      throw new BadRequestException('Fornecedor não encontrado ou inativo.');
    }

    // Valida produtos ativos
    const produtoIds = itens.map((i) => i.produto_id);
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: produtoIds }, ativo: true },
    });

    if (produtos.length !== produtoIds.length) {
      throw new BadRequestException('Um ou mais produtos não foram encontrados ou estão inativos.');
    }

    // Calcula subtotais e total
    const itensComSubtotal = itens.map((item) => ({
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.quantidade * item.preco_unitario,
    }));

    const total = itensComSubtotal.reduce((acc, item) => acc + item.subtotal, 0);

    // Cria entrada com itens em transação
    const entrada = await this.prisma.$transaction(async (tx) => {
      const novaEntrada = await tx.entrada_estoque.create({
        data: {
          fornecedor_id,
          status: 'rascunho',
          nota_fiscal,
          data_emissao: data_emissao ? new Date(data_emissao) : null,
          total,
          observacao,
          criado_por: userId,
          itens: {
            create: itensComSubtotal,
          },
        },
        include: {
          fornecedor: { select: { id: true, nome: true } },
          itens: {
            include: { produto: { select: { id: true, nome: true } } },
          },
        },
      });

      return novaEntrada;
    });

    return new ResponseMessage('Entrada de estoque criada com sucesso', entrada);
  }
}

export { CreateEntradaEstoqueCase };
