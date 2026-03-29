import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreateCategoriaProdutoDto } from './dto/create-categoria-produto.dto';
import { UpdateCategoriaProdutoDto } from './dto/update-categoria-produto.dto';
import { CreateCategoriaProdutoCase } from './useCases/create-categoria-produto';
import { FindAllCategoriaProdutoCase } from './useCases/find-all-categoria-produto';
import { UpdateCategoriaProdutoCase } from './useCases/update-categoria-produto';

@Injectable()
export class CategoriaProdutoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoriaProdutoDto, userId: string) {
    return new CreateCategoriaProdutoCase(this.prisma).execute(dto, userId);
  }

  async findAll(params: { search?: string; page: number; pageSize: number }) {
    return new FindAllCategoriaProdutoCase(this.prisma).execute(params);
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoria_produto.findFirst({
      where: { id, ativo: true },
      include: {
        produtos: {
          where: { ativo: true },
          select: { id: true, nome: true, preco: true, quantidade: true },
          orderBy: { nome: 'asc' },
        },
      },
    });

    if (!categoria) throw new NotFoundException('Categoria não encontrada.');

    return new ResponseMessage('Sucesso', categoria);
  }

  async update(id: string, dto: UpdateCategoriaProdutoDto, userId: string) {
    return new UpdateCategoriaProdutoCase(this.prisma).execute(id, dto, userId);
  }

  async toggleStatus(id: string, userId: string) {
    const categoria = await this.prisma.categoria_produto.findFirst({ where: { id } });

    if (!categoria) throw new NotFoundException('Categoria não encontrada.');

    const atualizado = await this.prisma.categoria_produto.update({
      where: { id },
      data: {
        ativo: !categoria.ativo,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
    });

    const msg = atualizado.ativo ? 'Categoria ativada' : 'Categoria desativada';
    return new ResponseMessage(msg, atualizado);
  }
}
