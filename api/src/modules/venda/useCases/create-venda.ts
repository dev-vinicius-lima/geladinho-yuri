import { BadRequestException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { STATUS_CAIXA } from 'src/common/constants/caixa';
import { FORMA_PAGAMENTO, STATUS_VENDA } from 'src/common/constants/venda';
import { TIPO_MOVIMENTACAO_ESTOQUE } from 'src/common/constants/estoque';
import { CreateVendaDto } from '../dto/create-venda.dto';

export class CreateVendaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateVendaDto, usuarioId: string) {
    const { itens, forma_pagamento, valor_recebido, desconto = 0, observacao } = dto;

    if (!itens || itens.length === 0) {
      throw new BadRequestException('A venda deve ter ao menos um item.');
    }

    // Valida caixa aberto
    const caixaAberto = await this.prisma.caixa.findFirst({
      where: { usuario_id: usuarioId, status: STATUS_CAIXA.ABERTO },
    });
    if (!caixaAberto) {
      throw new BadRequestException('Não há caixa aberto. Abra o caixa antes de registrar vendas.');
    }

    // Carrega os produtos para calcular preços
    const produtoIds = itens.map((i) => i.produto_id);
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: produtoIds }, ativo: true },
      select: { id: true, nome: true, preco: true, quantidade: true },
    });

    if (produtos.length !== produtoIds.length) {
      throw new BadRequestException('Um ou mais produtos não foram encontrados ou estão inativos.');
    }

    const produtoMap = Object.fromEntries(produtos.map((p) => [p.id, p]));

    // Valida estoque para todos os itens antes de qualquer alteração
    for (const item of itens) {
      const produto = produtoMap[item.produto_id];
      if (produto.quantidade < item.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidade}, solicitado: ${item.quantidade}.`,
        );
      }
    }

    // Calcula total bruto
    const totalBruto = itens.reduce((acc, item) => {
      return acc + Number(produtoMap[item.produto_id].preco) * item.quantidade;
    }, 0);

    const total = Math.max(0, totalBruto - desconto);

    // Valida pagamento em dinheiro
    if (forma_pagamento === FORMA_PAGAMENTO.DINHEIRO && valor_recebido !== undefined) {
      if (valor_recebido < total) {
        throw new BadRequestException(
          `Valor recebido (R$ ${valor_recebido.toFixed(2)}) é menor que o total (R$ ${total.toFixed(2)}).`,
        );
      }
    }

    const troco =
      forma_pagamento === FORMA_PAGAMENTO.DINHEIRO && valor_recebido
        ? valor_recebido - total
        : null;

    // Tudo válido — executa a transação
    const venda = await this.prisma.$transaction(async (tx) => {
      // Cria a venda
      const v = await tx.venda.create({
        data: {
          usuario_id: usuarioId,
          caixa_id: caixaAberto.id,
          status: STATUS_VENDA.CONCLUIDA,
          forma_pagamento,
          total,
          desconto,
          valor_recebido,
          troco,
          observacao,
          itens: {
            create: itens.map((item) => ({
              produto_id: item.produto_id,
              quantidade: item.quantidade,
              preco_unitario: Number(produtoMap[item.produto_id].preco),
              subtotal: Number(produtoMap[item.produto_id].preco) * item.quantidade,
            })),
          },
        },
        include: {
          itens: {
            include: { produto: { select: { id: true, nome: true } } },
          },
        },
      });

      // Desconta estoque e registra movimentações
      for (const item of itens) {
        await tx.produto.update({
          where: { id: item.produto_id },
          data: { quantidade: { decrement: item.quantidade } },
        });

        await tx.movimentacao_estoque.create({
          data: {
            produto_id: item.produto_id,
            venda_id: v.id,
            tipo: TIPO_MOVIMENTACAO_ESTOQUE.SAIDA,
            quantidade: item.quantidade,
            descricao: `Venda PDV #${v.id.slice(-6).toUpperCase()}`,
            criado_por: usuarioId,
          },
        });
      }

      return v;
    });

    return new ResponseMessage('Venda registrada com sucesso', venda);
  }
}
