import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { FindAllNotificacaoCase } from './useCases/find-all-notificacao';

@Injectable()
export class NotificacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { userId: string; page: number; pageSize: number }) {
    return new FindAllNotificacaoCase(this.prisma).execute(params);
  }

  async marcarComoLida(id: string, userId: string) {
    const notificacao = await this.prisma.notificacao.findFirst({
      where: { id, usuario_id: userId },
    });

    if (!notificacao) {
      throw new NotFoundException('Notificacao nao encontrada.');
    }

    const atualizada = await this.prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });

    return new ResponseMessage('Notificacao marcada como lida', atualizada);
  }

  async marcarTodasComoLidas(userId: string) {
    const { count } = await this.prisma.notificacao.updateMany({
      where: { usuario_id: userId, lida: false },
      data: { lida: true },
    });

    return new ResponseMessage(
      `${count} notificacao(oes) marcada(s) como lida(s)`,
    );
  }

  async countNaoLidas(userId: string) {
    const count = await this.prisma.notificacao.count({
      where: { usuario_id: userId, lida: false },
    });

    return new ResponseMessage('Sucesso', { count });
  }
}
