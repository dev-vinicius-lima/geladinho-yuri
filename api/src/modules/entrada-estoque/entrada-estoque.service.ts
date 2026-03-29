import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreateEntradaEstoqueDto } from './dto/create-entrada-estoque.dto';
import { UpdateEntradaEstoqueDto } from './dto/update-entrada-estoque.dto';
import { CreateEntradaEstoqueCase } from './useCases/create-entrada-estoque';
import { FindAllEntradaEstoqueCase } from './useCases/find-all-entrada-estoque';
import { ConfirmarEntradaEstoqueCase } from './useCases/confirmar-entrada-estoque';
import { CancelarEntradaEstoqueCase } from './useCases/cancelar-entrada-estoque';

@Injectable()
export class EntradaEstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEntradaEstoqueDto, userId: string) {
    return new CreateEntradaEstoqueCase(this.prisma).execute(dto, userId);
  }

  async findAll(params: {
    page: number;
    pageSize: number;
    fornecedor_id?: string;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  }) {
    return new FindAllEntradaEstoqueCase(this.prisma).execute(params);
  }

  async findOne(id: string) {
    const entrada = await this.prisma.entrada_estoque.findFirst({
      where: { id },
      include: {
        fornecedor: { select: { id: true, nome: true, cnpj: true } },
        itens: {
          include: {
            produto: { select: { id: true, nome: true, unidade: true, codigo: true } },
          },
        },
      },
    });

    if (!entrada) throw new NotFoundException('Entrada de estoque não encontrada.');

    return new ResponseMessage('Sucesso', entrada);
  }

  async update(id: string, dto: UpdateEntradaEstoqueDto, userId: string) {
    const entrada = await this.prisma.entrada_estoque.findFirst({
      where: { id },
    });

    if (!entrada) throw new NotFoundException('Entrada de estoque não encontrada.');

    if (entrada.status !== 'rascunho') {
      throw new BadRequestException(
        'Apenas entradas com status "rascunho" podem ser editadas.',
      );
    }

    // Valida fornecedor se informado
    if (dto.fornecedor_id) {
      const fornecedor = await this.prisma.fornecedor.findFirst({
        where: { id: dto.fornecedor_id, ativo: true },
      });
      if (!fornecedor) {
        throw new BadRequestException('Fornecedor não encontrado ou inativo.');
      }
    }

    const atualizada = await this.prisma.entrada_estoque.update({
      where: { id },
      data: {
        ...dto,
        data_emissao: dto.data_emissao ? new Date(dto.data_emissao) : undefined,
        atualizado_por: userId,
        atualizado_em: new Date(),
      },
    });

    return new ResponseMessage('Entrada de estoque atualizada com sucesso', atualizada);
  }

  async confirmar(id: string, userId: string) {
    return new ConfirmarEntradaEstoqueCase(this.prisma).execute(id, userId);
  }

  async cancelar(id: string, userId: string) {
    return new CancelarEntradaEstoqueCase(this.prisma).execute(id, userId);
  }
}
