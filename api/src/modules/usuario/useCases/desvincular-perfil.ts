import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';

export class DesvincularPerfilCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: string, perfilId: string) {
    const vinculo = await this.prisma.usuario_perfil.findUnique({
      where: { usuario_id_perfil_id: { usuario_id: usuarioId, perfil_id: perfilId } },
    });

    if (!vinculo) throw new NotFoundException('Vínculo não encontrado.');

    await this.prisma.usuario_perfil.delete({
      where: { usuario_id_perfil_id: { usuario_id: usuarioId, perfil_id: perfilId } },
    });

    return new ResponseMessage('Perfil desvinculado com sucesso.', null);
  }
}
