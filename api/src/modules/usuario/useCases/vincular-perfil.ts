import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';

export class VincularPerfilCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: string, perfilId: string, userId: string) {
    const usuario = await this.prisma.usuario.findFirst({ where: { id: usuarioId, ativo: true } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    const perfil = await this.prisma.perfil.findFirst({ where: { id: perfilId, ativo: true } });
    if (!perfil) throw new BadRequestException('Perfil não encontrado ou inativo.');

    await this.prisma.usuario_perfil.upsert({
      where: { usuario_id_perfil_id: { usuario_id: usuarioId, perfil_id: perfilId } },
      update: {},
      create: {
        usuario_id: usuarioId,
        perfil_id: perfilId,
        criado_por: userId,
      },
    });

    return new ResponseMessage('Perfil vinculado com sucesso.', { usuario_id: usuarioId, perfil_id: perfilId });
  }
}
