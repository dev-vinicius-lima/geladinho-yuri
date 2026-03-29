import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { CreateCategoriaFinanceiraDto } from './dto/create-categoria-financeira.dto';
import { CreateContaFinanceiraDto } from './dto/create-conta-financeira.dto';
import { UpdateContaFinanceiraDto } from './dto/update-conta-financeira.dto';
import { PagarContaDto } from './dto/pagar-conta.dto';
import { FindAllContasCase } from './useCases/find-all-contas';
import { ResumoFinanceiroCase } from './useCases/resumo-financeiro';
import { FluxoCaixaCase } from './useCases/fluxo-caixa';
import { DreCase } from './useCases/dre';

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── CATEGORIAS ──────────────────────────────────────────────────────────────

  async findAllCategorias() {
    const categorias = await this.prisma.categoria_financeira.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });

    return new ResponseMessage('Sucesso', categorias);
  }

  async createCategoria(dto: CreateCategoriaFinanceiraDto) {
    const categoria = await this.prisma.categoria_financeira.create({
      data: {
        nome: dto.nome,
        tipo: dto.tipo,
      },
    });

    return new ResponseMessage('Categoria financeira criada com sucesso', categoria);
  }

  // ─── CONTAS ──────────────────────────────────────────────────────────────────

  async findAllContas(params: {
    page: number;
    pageSize: number;
    tipo?: string;
    status?: string;
    vencimento_inicio?: string;
    vencimento_fim?: string;
    categoria_financeira_id?: string;
  }) {
    return new FindAllContasCase(this.prisma).execute(params);
  }

  async findOneConta(id: string) {
    const conta = await this.prisma.conta_financeira.findFirst({
      where: { id, ativo: true },
      include: {
        categoria: { select: { id: true, nome: true, tipo: true } },
      },
    });

    if (!conta) throw new NotFoundException('Conta financeira não encontrada.');

    return new ResponseMessage('Sucesso', conta);
  }

  async createConta(dto: CreateContaFinanceiraDto, userId: string) {
    const conta = await this.prisma.conta_financeira.create({
      data: {
        tipo: dto.tipo,
        descricao: dto.descricao,
        valor: dto.valor,
        vencimento: new Date(dto.vencimento),
        categoria_financeira_id: dto.categoria_financeira_id,
        observacao: dto.observacao,
        recorrente: dto.recorrente ?? false,
        criado_por: userId,
      },
    });

    return new ResponseMessage('Conta financeira criada com sucesso', conta);
  }

  async updateConta(id: string, dto: UpdateContaFinanceiraDto, userId: string) {
    const existing = await this.prisma.conta_financeira.findFirst({
      where: { id, ativo: true },
    });

    if (!existing) throw new NotFoundException('Conta financeira não encontrada.');

    const data: any = {
      atualizado_em: new Date(),
    };

    if (dto.tipo !== undefined) data.tipo = dto.tipo;
    if (dto.descricao !== undefined) data.descricao = dto.descricao;
    if (dto.valor !== undefined) data.valor = dto.valor;
    if (dto.vencimento !== undefined) data.vencimento = new Date(dto.vencimento);
    if (dto.categoria_financeira_id !== undefined) data.categoria_financeira_id = dto.categoria_financeira_id;
    if (dto.observacao !== undefined) data.observacao = dto.observacao;
    if (dto.recorrente !== undefined) data.recorrente = dto.recorrente;

    const conta = await this.prisma.conta_financeira.update({
      where: { id },
      data,
    });

    return new ResponseMessage('Conta financeira atualizada com sucesso', conta);
  }

  async pagarConta(id: string, dto: PagarContaDto, userId: string) {
    const existing = await this.prisma.conta_financeira.findFirst({
      where: { id, ativo: true },
    });

    if (!existing) throw new NotFoundException('Conta financeira não encontrada.');

    const conta = await this.prisma.conta_financeira.update({
      where: { id },
      data: {
        pago_em: new Date(),
        forma_pagamento: dto.forma_pagamento,
        atualizado_em: new Date(),
      },
    });

    return new ResponseMessage('Conta marcada como paga com sucesso', conta);
  }

  async removeConta(id: string, userId: string) {
    const existing = await this.prisma.conta_financeira.findFirst({
      where: { id, ativo: true },
    });

    if (!existing) throw new NotFoundException('Conta financeira não encontrada.');

    await this.prisma.conta_financeira.update({
      where: { id },
      data: {
        ativo: false,
        atualizado_em: new Date(),
      },
    });

    return new ResponseMessage('Conta financeira removida com sucesso');
  }

  // ─── RELATÓRIOS ──────────────────────────────────────────────────────────────

  async resumo() {
    return new ResumoFinanceiroCase(this.prisma).execute();
  }

  async fluxoCaixa(params: { data_inicio?: string; data_fim?: string }) {
    return new FluxoCaixaCase(this.prisma).execute(params);
  }

  async dre(params: { data_inicio?: string; data_fim?: string }) {
    return new DreCase(this.prisma).execute(params);
  }
}
