import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { CreatePerfilCase } from './useCases/create-perfil';
import { FindAllPerfilCase } from './useCases/find-all-perfil';
import { UpdatePerfilCase } from './useCases/update-perfil';

@Injectable()
export class PerfilService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePerfilDto, userId: string) {
    return new CreatePerfilCase(this.prisma).execute(dto, userId);
  }

  findAll(params: { search?: string; page: number; pageSize: number }) {
    return new FindAllPerfilCase(this.prisma).execute(params);
  }

  async findOne(id: string) {
    const perfil = await this.prisma.perfil.findFirst({
      where: { id, ativo: true },
      include: { _count: { select: { usuario_perfil: true } } },
    });
    if (!perfil) throw new NotFoundException('Perfil não encontrado.');
    return new ResponseMessage('Sucesso', perfil);
  }

  update(id: string, dto: UpdatePerfilDto, userId: string) {
    return new UpdatePerfilCase(this.prisma).execute(id, dto, userId);
  }

  async toggleStatus(id: string, userId: string) {
    const perfil = await this.prisma.perfil.findFirst({ where: { id } });
    if (!perfil) throw new NotFoundException('Perfil não encontrado.');

    const updated = await this.prisma.perfil.update({
      where: { id },
      data: { ativo: !perfil.ativo, atualizado_por: userId, atualizado_em: new Date() },
      select: { id: true, nome: true, ativo: true },
    });

    return new ResponseMessage(
      updated.ativo ? 'Perfil ativado.' : 'Perfil desativado.',
      updated,
    );
  }
}
