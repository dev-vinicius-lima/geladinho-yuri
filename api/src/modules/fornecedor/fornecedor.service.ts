import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { CreateFornecedorCase } from './useCases/create-fornecedor';
import { FindAllFornecedorCase } from './useCases/find-all-fornecedor';

@Injectable()
export class FornecedorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFornecedorDto, userId: string) {
    return new CreateFornecedorCase(this.prisma).execute(dto, userId);
  }

  async findAll(params: { search?: string; page: number; pageSize: number }) {
    return new FindAllFornecedorCase(this.prisma).execute(params);
  }

  async findOne(id: string) {
    const fornecedor = await this.prisma.fornecedor.findFirst({
      where: { id, ativo: true },
      include: {
        entradas_estoque: {
          orderBy: { criado_em: 'desc' },
          take: 20,
        },
      },
    });

    if (!fornecedor) throw new NotFoundException('Fornecedor nao encontrado.');

    return new ResponseMessage('Sucesso', fornecedor);
  }

  async update(id: string, dto: UpdateFornecedorDto, userId: string) {
    const fornecedor = await this.prisma.fornecedor.findFirst({
      where: { id, ativo: true },
    });

    if (!fornecedor) throw new NotFoundException('Fornecedor nao encontrado.');

    const atualizado = await this.prisma.fornecedor.update({
      where: { id },
      data: {
        ...dto,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
    });

    return new ResponseMessage('Fornecedor atualizado com sucesso', atualizado);
  }

  async toggleStatus(id: string, userId: string) {
    const fornecedor = await this.prisma.fornecedor.findFirst({ where: { id } });

    if (!fornecedor) throw new NotFoundException('Fornecedor nao encontrado.');

    const atualizado = await this.prisma.fornecedor.update({
      where: { id },
      data: {
        ativo: !fornecedor.ativo,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
    });

    const msg = atualizado.ativo ? 'Fornecedor ativado' : 'Fornecedor desativado';
    return new ResponseMessage(msg, atualizado);
  }
}
