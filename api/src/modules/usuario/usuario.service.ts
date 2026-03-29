import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { MinioClientService } from 'src/modules/@global/minio/minio.service';
import { BufferedFile } from 'src/modules/@global/minio/@types';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangeSenhaDto } from './dto/change-senha.dto';
import { CreateUsuarioCase } from './useCases/create-usuario';
import { FindAllUsuarioCase } from './useCases/find-all-usuario';
import { UpdateUsuarioCase } from './useCases/update-usuario';
import { ChangeSenhaCase } from './useCases/change-senha';
import { VincularPerfilCase } from './useCases/vincular-perfil';
import { DesvincularPerfilCase } from './useCases/desvincular-perfil';
import { UploadFotoCase } from './useCases/upload-foto';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioClientService,
  ) {}

  create(dto: CreateUsuarioDto, userId: string) {
    return new CreateUsuarioCase(this.prisma).execute(dto, userId);
  }

  findAll(params: { search?: string; page: number; pageSize: number }) {
    return new FindAllUsuarioCase(this.prisma).execute(params);
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, ativo: true },
      select: {
        id: true,
        nome: true,
        apelido: true,
        cpf: true,
        email: true,
        telefone: true,
        administrador: true,
        imagem: true,
        ativo: true,
        criado_em: true,
        ultimo_acesso_em: true,
        usuario_perfil_usuario_perfil_usuario_idTousuario: {
          select: {
            perfil: { select: { id: true, nome: true, identificador: true } },
          },
        },
      },
    });

    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    const { usuario_perfil_usuario_perfil_usuario_idTousuario, ...rest } = usuario;
    return new ResponseMessage('Sucesso', {
      ...rest,
      perfis: usuario_perfil_usuario_perfil_usuario_idTousuario.map((up) => up.perfil),
    });
  }

  update(id: string, dto: UpdateUsuarioDto, userId: string) {
    return new UpdateUsuarioCase(this.prisma).execute(id, dto, userId);
  }

  async toggleStatus(id: string, userId: string) {
    const usuario = await this.prisma.usuario.findFirst({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { ativo: !usuario.ativo, atualizado_por: userId, atualizado_em: new Date() },
      select: { id: true, nome: true, ativo: true },
    });

    return new ResponseMessage(
      updated.ativo ? 'Usuário ativado.' : 'Usuário desativado.',
      updated,
    );
  }

  changeSenha(userId: string, dto: ChangeSenhaDto) {
    return new ChangeSenhaCase(this.prisma).execute(userId, dto);
  }

  vincularPerfil(usuarioId: string, perfilId: string, userId: string) {
    return new VincularPerfilCase(this.prisma).execute(usuarioId, perfilId, userId);
  }

  desvincularPerfil(usuarioId: string, perfilId: string) {
    return new DesvincularPerfilCase(this.prisma).execute(usuarioId, perfilId);
  }

  async uploadFoto(userId: string, file: BufferedFile): Promise<ResponseMessage<{ imagem: string }>> {
    return new UploadFotoCase(this.prisma, this.minio).execute(userId, file);
  }
}
