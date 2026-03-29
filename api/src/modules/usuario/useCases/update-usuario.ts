import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

export class UpdateUsuarioCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateUsuarioDto, userId: string) {
    const usuario = await this.prisma.usuario.findFirst({ where: { id, ativo: true } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: {
        nome: dto.nome,
        apelido: dto.apelido,
        email: dto.email,
        telefone: dto.telefone,
        administrador: dto.administrador,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
      select: {
        id: true,
        nome: true,
        apelido: true,
        cpf: true,
        email: true,
        telefone: true,
        administrador: true,
        ativo: true,
        atualizado_em: true,
      },
    });

    return new ResponseMessage('Usuário atualizado com sucesso.', updated);
  }
}
