import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { ResponsePagination } from 'src/common/message/response-pagination';
import { STATUS_CAIXA } from 'src/common/constants/caixa';
import { AbrirCaixaDto } from './dto/abrir-caixa.dto';
import { FecharCaixaDto } from './dto/fechar-caixa.dto';
import { MovimentacaoCaixaDto } from './dto/movimentacao-caixa.dto';
import { AbrirCaixaCase } from './useCases/abrir-caixa';
import { FecharCaixaCase } from './useCases/fechar-caixa';
import { SangriaCase } from './useCases/sangria';
import { SuprimentoCase } from './useCases/suprimento';

@Injectable()
export class CaixaService {
  constructor(private readonly prisma: PrismaService) {}

  async abrir(dto: AbrirCaixaDto, userId: string) {
    return new AbrirCaixaCase(this.prisma).execute(dto, userId);
  }

  async fechar(caixaId: string, dto: FecharCaixaDto, userId: string) {
    return new FecharCaixaCase(this.prisma).execute(caixaId, dto, userId);
  }

  async getAberto(userId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: { usuario_id: userId, status: STATUS_CAIXA.ABERTO },
      include: {
        usuario: { select: { id: true, apelido: true } },
        movimentacoes: { orderBy: { criado_em: 'desc' } },
        _count: { select: { vendas: true } },
      },
    });

    if (!caixa) {
      return new ResponseMessage('Nenhum caixa aberto', null);
    }

    return new ResponseMessage('Sucesso', caixa);
  }

  async sangria(caixaId: string, dto: MovimentacaoCaixaDto, userId: string) {
    return new SangriaCase(this.prisma).execute(caixaId, dto, userId);
  }

  async suprimento(caixaId: string, dto: MovimentacaoCaixaDto, userId: string) {
    return new SuprimentoCase(this.prisma).execute(caixaId, dto, userId);
  }

  async findAll(params: { page: number; pageSize: number; userId: string }) {
    const { page, pageSize, userId } = params;
    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.caixa.findMany({
        where: { usuario_id: userId },
        take,
        skip,
        orderBy: { aberto_em: 'desc' },
        include: {
          usuario: { select: { id: true, apelido: true } },
          _count: { select: { vendas: true, movimentacoes: true } },
        },
      }),
      this.prisma.caixa.count({ where: { usuario_id: userId } }),
    ]);

    return new ResponsePagination({ message: 'Sucesso', data, take, page: pageNum, totalItems: total });
  }

  async findOne(id: string, userId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: { id, usuario_id: userId },
      include: {
        usuario: { select: { id: true, apelido: true } },
        movimentacoes: { orderBy: { criado_em: 'asc' } },
        vendas: {
          orderBy: { criado_em: 'desc' },
          select: {
            id: true,
            total: true,
            forma_pagamento: true,
            status: true,
            criado_em: true,
          },
        },
      },
    });

    if (!caixa) throw new NotFoundException('Caixa não encontrado.');

    return new ResponseMessage('Sucesso', caixa);
  }
}
