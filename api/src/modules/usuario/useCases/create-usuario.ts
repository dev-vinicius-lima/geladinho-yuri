import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';

export class CreateUsuarioCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateUsuarioDto, userId: string) {
    const existing = await this.prisma.usuario.findFirst({
      where: { cpf: dto.cpf },
    });

    if (existing) {
      throw new BadRequestException('Já existe um usuário com este CPF.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        apelido: dto.apelido,
        cpf: dto.cpf,
        email: dto.email,
        telefone: dto.telefone,
        senha: senhaHash,
        administrador: dto.administrador ?? false,
        criado_por: userId,
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
        criado_em: true,
      },
    });

    return new ResponseMessage('Usuário criado com sucesso.', usuario);
  }
}
