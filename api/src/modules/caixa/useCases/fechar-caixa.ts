import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { STATUS_CAIXA, TIPO_MOVIMENTACAO_CAIXA } from 'src/common/constants/caixa';
import { FORMA_PAGAMENTO } from 'src/common/constants/venda';
import { FecharCaixaDto } from '../dto/fechar-caixa.dto';

export class FecharCaixaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(caixaId: string, dto: FecharCaixaDto, userId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: { id: caixaId, usuario_id: userId, status: STATUS_CAIXA.ABERTO },
      include: {
        movimentacoes: true,
        vendas: {
          where: { status: 'concluida' },
          include: { itens: true },
        },
      },
    });

    if (!caixa) {
      throw new NotFoundException('Caixa aberto não encontrado para este operador.');
    }

    // Calcula totais do caixa
    const totalVendas = caixa.vendas.reduce(
      (acc, v) => acc + Number(v.total),
      0,
    );

    const totalVendasDinheiro = caixa.vendas
      .filter((v) => v.forma_pagamento === FORMA_PAGAMENTO.DINHEIRO)
      .reduce((acc, v) => acc + Number(v.total), 0);

    const totalSangrias = caixa.movimentacoes
      .filter((m) => m.tipo === TIPO_MOVIMENTACAO_CAIXA.SANGRIA)
      .reduce((acc, m) => acc + Number(m.valor), 0);

    const totalSuprimentos = caixa.movimentacoes
      .filter((m) => m.tipo === TIPO_MOVIMENTACAO_CAIXA.SUPRIMENTO)
      .reduce((acc, m) => acc + Number(m.valor), 0);

    // Saldo esperado: apenas dinheiro físico
    const saldoEsperado =
      Number(caixa.valor_abertura) +
      totalVendasDinheiro +
      totalSuprimentos -
      totalSangrias;

    const diferenca = dto.valor_fechamento - saldoEsperado;

    const caixaFechado = await this.prisma.caixa.update({
      where: { id: caixaId },
      data: {
        status: STATUS_CAIXA.FECHADO,
        valor_fechamento: dto.valor_fechamento,
        total_vendas: totalVendas,
        total_sangrias: totalSangrias,
        total_suprimentos: totalSuprimentos,
        saldo_esperado: saldoEsperado,
        diferenca: diferenca,
        fechado_em: new Date(),
        observacao: dto.observacao ?? caixa.observacao,
      },
    });

    return new ResponseMessage('Caixa fechado com sucesso', {
      ...caixaFechado,
      resumo: {
        total_vendas: totalVendas,
        total_vendas_dinheiro: totalVendasDinheiro,
        total_sangrias: totalSangrias,
        total_suprimentos: totalSuprimentos,
        saldo_esperado: saldoEsperado,
        valor_informado: dto.valor_fechamento,
        diferenca: diferenca,
        quantidade_vendas: caixa.vendas.length,
      },
    });
  }
}
