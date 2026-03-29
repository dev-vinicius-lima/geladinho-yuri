import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { UpdatePerfilDto } from '../dto/update-perfil.dto';

export class UpdatePerfilCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdatePerfilDto, userId: string) {
    const perfil = await this.prisma.perfil.findFirst({ where: { id, ativo: true } });
    if (!perfil) throw new NotFoundException('Perfil não encontrado.');

    if (dto.nome && dto.nome !== perfil.nome) {
      const existe = await this.prisma.perfil.findFirst({ where: { nome: dto.nome } });
      if (existe) throw new BadRequestException('Já existe um perfil com este nome.');
    }

    if (dto.identificador && dto.identificador !== perfil.identificador) {
      const existe = await this.prisma.perfil.findFirst({ where: { identificador: dto.identificador } });
      if (existe) throw new BadRequestException('Já existe um perfil com este identificador.');
    }

    const updated = await this.prisma.perfil.update({
      where: { id },
      data: {
        nome: dto.nome,
        identificador: dto.identificador,
        administrador: dto.administrador,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
    });

    return new ResponseMessage('Perfil atualizado com sucesso.', updated);
  }
}
