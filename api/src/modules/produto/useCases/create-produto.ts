import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { TIPO_MOVIMENTACAO_ESTOQUE } from 'src/common/constants/estoque';
import { CreateProdutoDto } from '../dto/create-produto.dto';

export class CreateProdutoCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateProdutoDto, userId: string) {
    // Verifica se categoria existe
    const categoria = await this.prisma.categoria_produto.findFirst({
      where: { id: dto.categoria_id, ativo: true },
    });
    if (!categoria) throw new NotFoundException('Categoria não encontrada.');

    // Nome único dentro da categoria
    const duplicado = await this.prisma.produto.findFirst({
      where: { nome: dto.nome, categoria_id: dto.categoria_id, ativo: true },
    });
    if (duplicado) throw new BadRequestException('Já existe um produto com este nome nesta categoria.');

    // Código único no sistema (se fornecido)
    if (dto.codigo) {
      const codigoDuplicado = await this.prisma.produto.findFirst({
        where: { codigo: dto.codigo },
      });
      if (codigoDuplicado) throw new BadRequestException('Este código já está em uso.');
    }

    const produto = await this.prisma.$transaction(async (tx) => {
      const p = await tx.produto.create({
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          codigo: dto.codigo,
          unidade: dto.unidade ?? 'un',
          preco: dto.preco,
          preco_custo: dto.preco_custo,
          quantidade: dto.quantidade,
          estoque_minimo: dto.estoque_minimo ?? 0,
          categoria_id: dto.categoria_id,
          criado_por: userId,
        },
        include: { categoria: { select: { id: true, nome: true } } },
      });

      // Registra movimentação de estoque inicial se quantidade > 0
      if (dto.quantidade > 0) {
        await tx.movimentacao_estoque.create({
          data: {
            produto_id: p.id,
            tipo: TIPO_MOVIMENTACAO_ESTOQUE.ENTRADA,
            quantidade: dto.quantidade,
            descricao: 'Estoque inicial',
            criado_por: userId,
          },
        });
      }

      return p;
    });

    return new ResponseMessage('Produto criado com sucesso', produto);
  }
}
