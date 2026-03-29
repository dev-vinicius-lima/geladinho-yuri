import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreatePerfilDto } from '../dto/create-perfil.dto';

export class CreatePerfilCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePerfilDto, userId: string) {
    const nomeExistente = await this.prisma.perfil.findFirst({
      where: { nome: dto.nome },
    });
    if (nomeExistente) throw new BadRequestException('Já existe um perfil com este nome.');

    const identificadorExistente = await this.prisma.perfil.findFirst({
      where: { identificador: dto.identificador },
    });
    if (identificadorExistente) throw new BadRequestException('Já existe um perfil com este identificador.');

    const perfil = await this.prisma.perfil.create({
      data: {
        nome: dto.nome,
        identificador: dto.identificador,
        administrador: dto.administrador ?? false,
        criado_por: userId,
      },
    });

    return new ResponseMessage('Perfil criado com sucesso.', perfil);
  }
}
