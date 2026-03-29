import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';

class FluxoCaixaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { data_inicio?: string; data_fim?: string }) {
    const { data_inicio, data_fim } = params;

    if (!data_inicio || !data_fim) {
      throw new BadRequestException('data_inicio e data_fim são obrigatórios.');
    }

    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    fim.setHours(23, 59, 59, 999);

    const contas = await this.prisma.conta_financeira.findMany({
      where: {
        ativo: true,
        vencimento: { gte: inicio, lte: fim },
      },
      orderBy: { vencimento: 'asc' },
      select: {
        tipo: true,
        valor: true,
        vencimento: true,
        pago_em: true,
      },
    });

    // Agrupar por dia
    const mapaDias = new Map<string, { entradas: number; saidas: number }>();

    // Preencher todos os dias do intervalo
    const current = new Date(inicio);
    while (current <= fim) {
      const key = current.toISOString().split('T')[0];
      mapaDias.set(key, { entradas: 0, saidas: 0 });
      current.setDate(current.getDate() + 1);
    }

    // Distribuir valores nos dias
    for (const conta of contas) {
      const key = new Date(conta.vencimento).toISOString().split('T')[0];
      const dia = mapaDias.get(key);
      if (!dia) continue;

      const valor = Number(conta.valor);
      if (conta.tipo === 'receber') {
        dia.entradas += valor;
      } else {
        dia.saidas += valor;
      }
    }

    // Montar array com saldo do dia
    const fluxo = Array.from(mapaDias.entries()).map(([data, valores]) => ({
      data,
      entradas: Number(valores.entradas.toFixed(2)),
      saidas: Number(valores.saidas.toFixed(2)),
      saldo_dia: Number((valores.entradas - valores.saidas).toFixed(2)),
    }));

    return new ResponseMessage('Sucesso', fluxo);
  }
}

export { FluxoCaixaCase };
