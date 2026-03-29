import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { ChangeSenhaDto } from '../dto/change-senha.dto';

export class ChangeSenhaCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: ChangeSenhaDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: userId, ativo: true },
      select: { id: true, senha: true },
    });

    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    const senhaValida = await bcrypt.compare(dto.senha_atual, usuario.senha ?? '');
    if (!senhaValida) {
      throw new BadRequestException('Senha atual incorreta.');
    }

    const novaHash = await bcrypt.hash(dto.nova_senha, 10);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { senha: novaHash, atualizado_em: new Date() },
    });

    return new ResponseMessage('Senha alterada com sucesso.', null);
  }
}
