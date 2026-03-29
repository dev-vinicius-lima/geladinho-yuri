import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';

export class GetRecentesCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(limite = 10) {
    const vendas = await this.prisma.venda.findMany({
      take: limite,
      orderBy: { criado_em: 'desc' },
      select: {
        id: true,
        total: true,
        forma_pagamento: true,
        status: true,
        criado_em: true,
        usuario: { select: { apelido: true } },
        itens: {
          select: {
            quantidade: true,
            subtotal: true,
            produto: { select: { nome: true } },
          },
        },
      },
    });

    return new ResponseMessage('Sucesso', vendas);
  }
}
