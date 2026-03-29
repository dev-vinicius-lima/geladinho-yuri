import { BadRequestException } from '@nestjs/common';
import { ResponseMessage } from 'src/common/message/response-message';
import { PrismaService } from 'src/database/prisma.service';
import { STATUS_CAIXA } from 'src/common/constants/caixa';
import { AbrirCaixaDto } from '../dto/abrir-caixa.dto';

export class AbrirCaixaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: AbrirCaixaDto, userId: string) {
    // Garante que não há outro caixa aberto para este operador
    const caixaAberto = await this.prisma.caixa.findFirst({
      where: { usuario_id: userId, status: STATUS_CAIXA.ABERTO },
    });

    if (caixaAberto) {
      throw new BadRequestException(
        'Já existe um caixa aberto para este operador. Feche-o antes de abrir um novo.',
      );
    }

    const caixa = await this.prisma.caixa.create({
      data: {
        usuario_id: userId,
        valor_abertura: dto.valor_abertura,
        observacao: dto.observacao,
        status: STATUS_CAIXA.ABERTO,
        criado_por: userId,
      },
      include: {
        usuario: { select: { id: true, apelido: true } },
      },
    });

    return new ResponseMessage('Caixa aberto com sucesso', caixa);
  }
}
