import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ExportHelper, formatBRL, formatPercent } from 'src/common/helpers/export.helper';
import { RelatorioSemanalCase } from './useCases/relatorio-semanal';
import { RelatorioMensalCase } from './useCases/relatorio-mensal';
import { RelatorioAnualCase } from './useCases/relatorio-anual';
import { RelatorioProdutosCase } from './useCases/relatorio-produtos';
import { RelatorioCaixaCase } from './useCases/relatorio-caixa';
import { RelatorioOperadorCase } from './useCases/relatorio-operador';
import { RelatorioEstoqueCase } from './useCases/relatorio-estoque';
import { RelatorioLucratividadeCase } from './useCases/relatorio-lucratividade';

export type ExportResult = { buffer: Buffer; contentType: string; filename: string };

type FormatoExport = 'xlsx' | 'csv' | 'pdf';

@Injectable()
export class RelatorioService {
  constructor(private readonly prisma: PrismaService) {}

  async semanal(dataRef?: string) {
    return new RelatorioSemanalCase(this.prisma).execute(dataRef);
  }

  async mensal(mes?: string) {
    return new RelatorioMensalCase(this.prisma).execute(mes);
  }

  async anual(ano?: number) {
    return new RelatorioAnualCase(this.prisma).execute(ano);
  }

  async produtos(params: { data_inicio?: string; data_fim?: string; top?: number }) {
    return new RelatorioProdutosCase(this.prisma).execute(params);
  }

  async caixa(caixaId: string) {
    return new RelatorioCaixaCase(this.prisma).execute(caixaId);
  }

  async operador(params: { data_inicio?: string; data_fim?: string; operador_id?: string }) {
    return new RelatorioOperadorCase(this.prisma).execute(params);
  }

  async estoque(params: { categoria_id?: string; apenas_critico?: boolean }) {
    return new RelatorioEstoqueCase(this.prisma).execute(params);
  }

  async lucratividade(params: { data_inicio?: string; data_fim?: string }) {
    return new RelatorioLucratividadeCase(this.prisma).execute(params);
  }

  // ─── EXPORTS ───────────────────────────────────────────────────────────────

  async exportarEstoque(
    params: { categoria_id?: string; apenas_critico?: boolean },
    formato: FormatoExport,
  ): Promise<ExportResult> {
    const result = await new RelatorioEstoqueCase(this.prisma).execute(params);
    const { totais, produtos } = result.data!;

    const headers = ['Nome', 'Código', 'Categoria', 'Qtd', 'Est. Mín.', 'Crítico', 'Preço Custo', 'Preço Venda', 'Margem %', 'Val. Custo', 'Val. Venda'];
    const rows = produtos.map((p) => [
      p.nome,
      p.codigo ?? '',
      p.categoria?.nome ?? '',
      p.quantidade,
      p.estoque_minimo,
      p.estoque_critico ? 'SIM' : 'não',
      p.preco_custo ?? '',
      p.preco_venda,
      p.margem_percentual ?? '',
      p.valor_em_custo ?? '',
      p.valor_em_venda,
    ]);

    if (formato === 'xlsx') {
      return {
        buffer: ExportHelper.toXlsx('Estoque', headers, rows),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'relatorio-estoque.xlsx',
      };
    }

    if (formato === 'csv') {
      return {
        buffer: ExportHelper.toCsv(headers, rows),
        contentType: 'text/csv; charset=utf-8',
        filename: 'relatorio-estoque.csv',
      };
    }

    // PDF
    const buffer = await ExportHelper.toPdf('Relatório de Estoque', [
      {
        title: 'Resumo',
        summary: [
          { label: 'Total de itens', value: String(totais.total_itens) },
          { label: 'Itens críticos', value: String(totais.total_criticos) },
          { label: 'Valor total em custo', value: formatBRL(totais.total_valor_custo) },
          { label: 'Valor total em venda', value: formatBRL(totais.total_valor_venda) },
        ],
      },
      {
        title: 'Produtos',
        table: {
          headers: ['Nome', 'Qtd', 'Est.Mín', 'Crítico', 'P.Custo', 'P.Venda', 'Margem%'],
          rows: produtos.map((p) => [
            p.nome,
            p.quantidade,
            p.estoque_minimo,
            p.estoque_critico ? 'SIM' : '-',
            formatBRL(p.preco_custo),
            formatBRL(p.preco_venda),
            formatPercent(p.margem_percentual),
          ]),
        },
      },
    ]);

    return { buffer, contentType: 'application/pdf', filename: 'relatorio-estoque.pdf' };
  }

  async exportarOperador(
    params: { data_inicio?: string; data_fim?: string; operador_id?: string },
    formato: FormatoExport,
  ): Promise<ExportResult> {
    const result = await new RelatorioOperadorCase(this.prisma).execute(params);
    const { periodo, operadores } = result.data!;

    const headers = ['Operador', 'Total Vendas', 'Concluídas', 'Canceladas', 'Receita (R$)', 'Ticket Médio (R$)'];
    const rows = operadores.map((op) => [
      op.operador.nome ?? op.operador.apelido ?? op.operador.id,
      op.total_vendas,
      op.qtd_concluidas,
      op.qtd_canceladas,
      op.receita,
      Number(op.ticket_medio.toFixed(2)),
    ]);

    if (formato === 'xlsx') {
      return {
        buffer: ExportHelper.toXlsx('Operadores', headers, rows),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'relatorio-operador.xlsx',
      };
    }

    if (formato === 'csv') {
      return {
        buffer: ExportHelper.toCsv(headers, rows),
        contentType: 'text/csv; charset=utf-8',
        filename: 'relatorio-operador.csv',
      };
    }

    const buffer = await ExportHelper.toPdf('Relatório por Operador', [
      {
        title: 'Período',
        summary: [
          { label: 'Início', value: periodo.data_inicio ?? 'todos' },
          { label: 'Fim', value: periodo.data_fim ?? 'todos' },
        ],
      },
      {
        title: 'Operadores',
        table: {
          headers: ['Operador', 'Total', 'Concluídas', 'Canceladas', 'Receita', 'Ticket Médio'],
          rows: operadores.map((op) => [
            op.operador.nome ?? op.operador.apelido ?? op.operador.id,
            op.total_vendas,
            op.qtd_concluidas,
            op.qtd_canceladas,
            formatBRL(op.receita),
            formatBRL(op.ticket_medio),
          ]),
        },
      },
    ]);

    return { buffer, contentType: 'application/pdf', filename: 'relatorio-operador.pdf' };
  }

  async exportarLucratividade(
    params: { data_inicio?: string; data_fim?: string },
    formato: FormatoExport,
  ): Promise<ExportResult> {
    const result = await new RelatorioLucratividadeCase(this.prisma).execute(params);
    const { periodo, resumo, produtos } = result.data!;

    const headers = ['Produto', 'Unidade', 'Qtd', 'Receita (R$)', 'Custo Total (R$)', 'Lucro Bruto (R$)', 'Margem %'];
    const rows = produtos.map((p) => [
      p.nome,
      p.unidade,
      p.quantidade,
      Number(p.receita.toFixed(2)),
      p.custo_total != null ? Number(p.custo_total.toFixed(2)) : '',
      p.lucro_bruto != null ? Number(p.lucro_bruto.toFixed(2)) : '',
      p.margem_percentual ?? '',
    ]);

    if (formato === 'xlsx') {
      return {
        buffer: ExportHelper.toXlsx('Lucratividade', headers, rows),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'relatorio-lucratividade.xlsx',
      };
    }

    if (formato === 'csv') {
      return {
        buffer: ExportHelper.toCsv(headers, rows),
        contentType: 'text/csv; charset=utf-8',
        filename: 'relatorio-lucratividade.csv',
      };
    }

    const buffer = await ExportHelper.toPdf('Relatório de Lucratividade', [
      {
        title: 'Período',
        summary: [
          { label: 'Início', value: periodo.data_inicio ?? 'todos' },
          { label: 'Fim', value: periodo.data_fim ?? 'todos' },
        ],
      },
      {
        title: 'Resumo',
        summary: [
          { label: 'Receita Total', value: formatBRL(resumo.receita_total) },
          { label: 'Custo Total', value: formatBRL(resumo.custo_total) },
          { label: 'Lucro Bruto', value: formatBRL(resumo.lucro_bruto) },
          { label: 'Margem Geral', value: formatPercent(resumo.margem_geral_percentual) },
          ...(resumo.aviso ? [{ label: 'Aviso', value: resumo.aviso }] : []),
        ],
      },
      {
        title: 'Produtos',
        table: {
          headers: ['Produto', 'Qtd', 'Receita', 'Custo', 'Lucro', 'Margem%'],
          rows: produtos.map((p) => [
            p.nome,
            p.quantidade,
            formatBRL(p.receita),
            formatBRL(p.custo_total),
            formatBRL(p.lucro_bruto),
            formatPercent(p.margem_percentual),
          ]),
        },
      },
    ]);

    return { buffer, contentType: 'application/pdf', filename: 'relatorio-lucratividade.pdf' };
  }

  async exportarCaixa(caixaId: string, formato: FormatoExport): Promise<ExportResult> {
    const result = await new RelatorioCaixaCase(this.prisma).execute(caixaId);
    const { caixa, vendas, movimentacoes } = result.data!;

    const formas = Object.entries(vendas.por_forma_pagamento).map(([forma, dados]) => [
      forma,
      (dados as { quantidade: number; total: number }).quantidade,
      formatBRL((dados as { quantidade: number; total: number }).total),
    ]);

    const sangriasRows = movimentacoes.sangrias.map((s: { valor: number; descricao: string | null; criado_em: Date }) => [
      new Date(s.criado_em).toLocaleString('pt-BR'),
      s.descricao ?? '-',
      formatBRL(s.valor),
    ]);

    const suprimentosRows = movimentacoes.suprimentos.map((s: { valor: number; descricao: string | null; criado_em: Date }) => [
      new Date(s.criado_em).toLocaleString('pt-BR'),
      s.descricao ?? '-',
      formatBRL(s.valor),
    ]);

    if (formato === 'xlsx') {
      const wb = require('xlsx').utils.book_new() as ReturnType<typeof import('xlsx').utils.book_new>;
      const addSheet = (name: string, headers: string[], rows: (string | number)[][]) => {
        const ws = require('xlsx').utils.aoa_to_sheet([headers, ...rows]);
        require('xlsx').utils.book_append_sheet(wb, ws, name);
      };
      addSheet('Resumo', ['Campo', 'Valor'], [
        ['Operador', caixa.operador?.nome ?? '-'],
        ['Status', caixa.status],
        ['Aberto em', caixa.aberto_em ? new Date(caixa.aberto_em).toLocaleString('pt-BR') : '-'],
        ['Fechado em', caixa.fechado_em ? new Date(caixa.fechado_em).toLocaleString('pt-BR') : '-'],
        ['Valor Abertura', caixa.valor_abertura],
        ['Valor Fechamento', caixa.valor_fechamento ?? '-'],
        ['Saldo Esperado', caixa.saldo_esperado ?? '-'],
        ['Diferença', caixa.diferenca ?? '-'],
        ['Total Vendas', vendas.total],
        ['Qtd. Vendas', vendas.quantidade],
        ['Total Sangrias', movimentacoes.total_sangrias],
        ['Total Suprimentos', movimentacoes.total_suprimentos],
      ]);
      addSheet('Vendas por Forma', ['Forma', 'Qtd', 'Total'], formas);
      if (sangriasRows.length) addSheet('Sangrias', ['Data/Hora', 'Descrição', 'Valor'], sangriasRows);
      if (suprimentosRows.length) addSheet('Suprimentos', ['Data/Hora', 'Descrição', 'Valor'], suprimentosRows);
      const buffer = require('xlsx').write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
      return {
        buffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `relatorio-caixa-${caixaId.slice(0, 8)}.xlsx`,
      };
    }

    if (formato === 'csv') {
      const rows: (string | number)[][] = [
        ['Operador', caixa.operador?.nome ?? '-'],
        ['Status', caixa.status],
        ['Total Vendas (R$)', vendas.total],
        ['Qtd. Vendas', vendas.quantidade],
        ['Total Sangrias', movimentacoes.total_sangrias],
        ['Total Suprimentos', movimentacoes.total_suprimentos],
      ];
      return {
        buffer: ExportHelper.toCsv(['Campo', 'Valor'], rows),
        contentType: 'text/csv; charset=utf-8',
        filename: `relatorio-caixa-${caixaId.slice(0, 8)}.csv`,
      };
    }

    const buffer = await ExportHelper.toPdf(`Relatório de Caixa`, [
      {
        title: 'Informações do Caixa',
        summary: [
          { label: 'Operador', value: caixa.operador?.nome ?? '-' },
          { label: 'Status', value: caixa.status },
          { label: 'Aberto em', value: caixa.aberto_em ? new Date(caixa.aberto_em).toLocaleString('pt-BR') : '-' },
          { label: 'Fechado em', value: caixa.fechado_em ? new Date(caixa.fechado_em).toLocaleString('pt-BR') : '-' },
          { label: 'Valor de Abertura', value: formatBRL(caixa.valor_abertura) },
          { label: 'Valor de Fechamento', value: formatBRL(caixa.valor_fechamento) },
          { label: 'Saldo Esperado', value: formatBRL(caixa.saldo_esperado) },
          { label: 'Diferença', value: formatBRL(caixa.diferenca) },
        ],
      },
      {
        title: 'Vendas',
        summary: [
          { label: 'Quantidade', value: String(vendas.quantidade) },
          { label: 'Total', value: formatBRL(vendas.total) },
        ],
        table: {
          headers: ['Forma de Pagamento', 'Quantidade', 'Total'],
          rows: formas,
        },
      },
      ...(sangriasRows.length
        ? [{
            title: 'Sangrias',
            summary: [{ label: 'Total', value: formatBRL(movimentacoes.total_sangrias) }],
            table: { headers: ['Data/Hora', 'Descrição', 'Valor'], rows: sangriasRows },
          }]
        : []),
      ...(suprimentosRows.length
        ? [{
            title: 'Suprimentos',
            summary: [{ label: 'Total', value: formatBRL(movimentacoes.total_suprimentos) }],
            table: { headers: ['Data/Hora', 'Descrição', 'Valor'], rows: suprimentosRows },
          }]
        : []),
    ]);

    return { buffer, contentType: 'application/pdf', filename: `relatorio-caixa-${caixaId.slice(0, 8)}.pdf` };
  }
}
