import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { STATUS_CAIXA, TIPO_MOVIMENTACAO_CAIXA } from 'src/common/constants/caixa';
import { FORMA_PAGAMENTO } from 'src/common/constants/venda';
import { MovimentacaoCaixaDto } from '../dto/movimentacao-caixa.dto';

export class SangriaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(caixaId: string, dto: MovimentacaoCaixaDto, userId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: { id: caixaId, usuario_id: userId, status: STATUS_CAIXA.ABERTO },
      include: { movimentacoes: true, vendas: { where: { status: 'concluida' } } },
    });

    if (!caixa) throw new NotFoundException('Caixa aberto não encontrado.');

    // Calcula saldo atual em dinheiro
    const vendasDinheiro = caixa.vendas
      .filter((v) => v.forma_pagamento === FORMA_PAGAMENTO.DINHEIRO)
      .reduce((acc, v) => acc + Number(v.total), 0);

    const totalSangrias = caixa.movimentacoes
      .filter((m) => m.tipo === TIPO_MOVIMENTACAO_CAIXA.SANGRIA)
      .reduce((acc, m) => acc + Number(m.valor), 0);

    const totalSuprimentos = caixa.movimentacoes
      .filter((m) => m.tipo === TIPO_MOVIMENTACAO_CAIXA.SUPRIMENTO)
      .reduce((acc, m) => acc + Number(m.valor), 0);

    const saldoAtual =
      Number(caixa.valor_abertura) + vendasDinheiro + totalSuprimentos - totalSangrias;

    if (dto.valor > saldoAtual) {
      throw new BadRequestException(
        `Saldo insuficiente para sangria. Saldo atual: R$ ${saldoAtual.toFixed(2)}.`,
      );
    }

    const movimentacao = await this.prisma.movimentacao_caixa.create({
      data: {
        caixa_id: caixaId,
        tipo: TIPO_MOVIMENTACAO_CAIXA.SANGRIA,
        valor: dto.valor,
        descricao: dto.descricao,
        criado_por: userId,
      },
    });

    return new ResponseMessage('Sangria registrada com sucesso', {
      ...movimentacao,
      saldo_anterior: saldoAtual,
      saldo_atual: saldoAtual - dto.valor,
    });
  }
}
