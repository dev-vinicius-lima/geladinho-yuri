import { NotFoundException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { STATUS_CAIXA, TIPO_MOVIMENTACAO_CAIXA } from 'src/common/constants/caixa';
import { MovimentacaoCaixaDto } from '../dto/movimentacao-caixa.dto';

export class SuprimentoCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(caixaId: string, dto: MovimentacaoCaixaDto, userId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: { id: caixaId, usuario_id: userId, status: STATUS_CAIXA.ABERTO },
    });

    if (!caixa) throw new NotFoundException('Caixa aberto não encontrado.');

    const movimentacao = await this.prisma.movimentacao_caixa.create({
      data: {
        caixa_id: caixaId,
        tipo: TIPO_MOVIMENTACAO_CAIXA.SUPRIMENTO,
        valor: dto.valor,
        descricao: dto.descricao,
        criado_por: userId,
      },
    });

    return new ResponseMessage('Suprimento registrado com sucesso', movimentacao);
  }
}
