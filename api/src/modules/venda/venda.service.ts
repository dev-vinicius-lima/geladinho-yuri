import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { ExportHelper, formatBRL } from 'src/common/helpers/export.helper';
import { CreateVendaDto } from './dto/create-venda.dto';
import { CreateVendaCase } from './useCases/create-venda';
import { CancelarVendaCase } from './useCases/cancelar-venda';
import { GetDashboardCase } from './useCases/get-dashboard';
import { GetRecentesCase } from './useCases/get-recentes';
import { FindAllVendaCase } from './useCases/find-all-venda';

export type ExportResult = { buffer: Buffer; contentType: string; filename: string };

@Injectable()
export class VendaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVendaDto, usuarioId: string) {
    return new CreateVendaCase(this.prisma).execute(dto, usuarioId);
  }

  async findAll(params: {
    page: number;
    pageSize: number;
    status?: string;
    forma_pagamento?: string;
    data_inicio?: string;
    data_fim?: string;
    caixa_id?: string;
  }) {
    return new FindAllVendaCase(this.prisma).execute(params);
  }

  async findOne(id: string) {
    const venda = await this.prisma.venda.findFirst({
      where: { id },
      include: {
        itens: {
          include: { produto: { select: { id: true, nome: true, unidade: true } } },
        },
        usuario: { select: { id: true, apelido: true } },
        caixa: { select: { id: true, status: true, aberto_em: true } },
      },
    });

    if (!venda) throw new NotFoundException('Venda não encontrada.');

    return new ResponseMessage('Sucesso', venda);
  }

  async cancelar(id: string, usuarioId: string) {
    return new CancelarVendaCase(this.prisma).execute(id, usuarioId);
  }

  async getDashboard(usuarioId: string) {
    return new GetDashboardCase(this.prisma).execute(usuarioId);
  }

  async getRecentes() {
    return new GetRecentesCase(this.prisma).execute();
  }

  async exportar(
    params: {
      status?: string;
      forma_pagamento?: string;
      data_inicio?: string;
      data_fim?: string;
      caixa_id?: string;
    },
    formato: 'pdf' | 'xlsx' | 'csv',
  ): Promise<ExportResult> {
    const { status, forma_pagamento, data_inicio, data_fim, caixa_id } = params;

    const where: any = {};
    if (status) where.status = status;
    if (forma_pagamento) where.forma_pagamento = forma_pagamento;
    if (caixa_id) where.caixa_id = caixa_id;
    if (data_inicio || data_fim) {
      where.criado_em = {};
      if (data_inicio) where.criado_em.gte = new Date(data_inicio);
      if (data_fim) {
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        where.criado_em.lte = fim;
      }
    }

    const vendas = await this.prisma.venda.findMany({
      where,
      orderBy: { criado_em: 'desc' },
      include: {
        itens: { include: { produto: { select: { nome: true } } } },
        usuario: { select: { apelido: true, nome: true } },
      },
    });

    const headers = ['Data', 'Operador', 'Forma Pgto', 'Itens', 'Desconto (R$)', 'Total (R$)', 'Status'];
    const rows = vendas.map((v) => [
      new Date(v.criado_em).toLocaleString('pt-BR'),
      v.usuario?.nome ?? v.usuario?.apelido ?? '-',
      v.forma_pagamento,
      v.itens.length,
      Number(v.desconto),
      Number(v.total),
      v.status,
    ]);

    if (formato === 'xlsx') {
      return {
        buffer: ExportHelper.toXlsx('Vendas', headers, rows),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'vendas.xlsx',
      };
    }

    if (formato === 'csv') {
      return {
        buffer: ExportHelper.toCsv(headers, rows),
        contentType: 'text/csv; charset=utf-8',
        filename: 'vendas.csv',
      };
    }

    const totalGeral = vendas
      .filter((v) => v.status === 'concluida')
      .reduce((sum, v) => sum + Number(v.total), 0);

    const buffer = await ExportHelper.toPdf('Relatório de Vendas', [
      {
        title: 'Resumo',
        summary: [
          { label: 'Total de vendas', value: String(vendas.length) },
          { label: 'Receita (concluídas)', value: formatBRL(totalGeral) },
          ...(data_inicio ? [{ label: 'Início', value: data_inicio }] : []),
          ...(data_fim ? [{ label: 'Fim', value: data_fim }] : []),
        ],
      },
      {
        title: 'Vendas',
        table: { headers, rows },
      },
    ]);

    return { buffer, contentType: 'application/pdf', filename: 'vendas.pdf' };
  }
}
