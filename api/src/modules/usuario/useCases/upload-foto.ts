import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { MinioClientService } from 'src/modules/@global/minio/minio.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { BufferedFile } from 'src/modules/@global/minio/@types';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

export class UploadFotoCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioClientService,
  ) {}

  async execute(userId: string, file: BufferedFile) {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      throw new BadRequestException('Formato inválido. Use JPG, PNG ou WebP.');
    }

    if (file.size > TAMANHO_MAXIMO) {
      throw new BadRequestException('Arquivo muito grande. Máximo 5MB.');
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: { id: userId, ativo: true },
      select: { id: true, imagem: true },
    });

    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    const result = await this.minio.uploadFile(file, {
      pastaDestino: 'usuarios',
      objetoDestino: `${userId}-foto`,
    });

    if (!result.success) {
      throw new BadRequestException('Erro ao fazer upload da imagem.');
    }

    const uploadData = result.data as { path: string };
    const url = uploadData.path;

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { imagem: url, atualizado_em: new Date() },
    });

    return new ResponseMessage('Foto atualizada com sucesso.', { imagem: url });
  }
}
