import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { RelatorioService } from './relatorio.service';

@ApiTags('Relatórios')
@ApiBearerAuth('JWT-auth')
@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  @Get('semanal')
  @ApiQuery({ name: 'data_ref', required: false, example: '2025-03-27', description: 'Data de referência (último dia da semana)' })
  semanal(@Query('data_ref') dataRef?: string) {
    return this.relatorioService.semanal(dataRef);
  }

  @Get('mensal')
  @ApiQuery({ name: 'mes', required: false, example: '2025-03', description: 'Mês no formato YYYY-MM' })
  mensal(@Query('mes') mes?: string) {
    return this.relatorioService.mensal(mes);
  }

  @Get('anual')
  @ApiQuery({ name: 'ano', required: false, example: 2025 })
  anual(@Query('ano') ano?: string) {
    return this.relatorioService.anual(ano ? +ano : undefined);
  }

  @Get('produtos')
  @ApiQuery({ name: 'data_inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'data_fim', required: false, example: '2025-12-31' })
  @ApiQuery({ name: 'top', required: false, example: 10 })
  produtos(
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
    @Query('top') top?: string,
  ) {
    return this.relatorioService.produtos({ data_inicio, data_fim, top: top ? +top : 10 });
  }

  @Get('caixa/:id')
  caixa(@Param('id') id: string) {
    return this.relatorioService.caixa(id);
  }

  @Get('caixa/:id/exportar')
  @ApiQuery({ name: 'formato', required: false, enum: ['pdf', 'xlsx', 'csv'], example: 'pdf' })
  async exportarCaixa(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Query('formato') formato = 'pdf',
  ): Promise<StreamableFile> {
    const { buffer, contentType, filename } = await this.relatorioService.exportarCaixa(
      id,
      formato as 'pdf' | 'xlsx' | 'csv',
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }

  @Get('operador')
  @ApiQuery({ name: 'data_inicio', required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'data_fim', required: false, example: '2026-03-31' })
  @ApiQuery({ name: 'operador_id', required: false, description: 'Filtrar por operador específico' })
  operador(
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
    @Query('operador_id') operador_id?: string,
  ) {
    return this.relatorioService.operador({ data_inicio, data_fim, operador_id });
  }

  @Get('operador/exportar')
  @ApiQuery({ name: 'formato', required: false, enum: ['pdf', 'xlsx', 'csv'], example: 'xlsx' })
  @ApiQuery({ name: 'data_inicio', required: false })
  @ApiQuery({ name: 'data_fim', required: false })
  @ApiQuery({ name: 'operador_id', required: false })
  async exportarOperador(
    @Res({ passthrough: true }) res: Response,
    @Query('formato') formato = 'xlsx',
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
    @Query('operador_id') operador_id?: string,
  ): Promise<StreamableFile> {
    const { buffer, contentType, filename } = await this.relatorioService.exportarOperador(
      { data_inicio, data_fim, operador_id },
      formato as 'pdf' | 'xlsx' | 'csv',
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }

  @Get('estoque')
  @ApiQuery({ name: 'categoria_id', required: false })
  @ApiQuery({ name: 'apenas_critico', required: false, type: Boolean, description: 'Somente produtos abaixo do estoque mínimo' })
  estoque(
    @Query('categoria_id') categoria_id?: string,
    @Query('apenas_critico') apenas_critico?: string,
  ) {
    return this.relatorioService.estoque({
      categoria_id,
      apenas_critico: apenas_critico === 'true',
    });
  }

  @Get('estoque/exportar')
  @ApiQuery({ name: 'formato', required: false, enum: ['pdf', 'xlsx', 'csv'], example: 'xlsx' })
  @ApiQuery({ name: 'categoria_id', required: false })
  @ApiQuery({ name: 'apenas_critico', required: false, type: Boolean })
  async exportarEstoque(
    @Res({ passthrough: true }) res: Response,
    @Query('formato') formato = 'xlsx',
    @Query('categoria_id') categoria_id?: string,
    @Query('apenas_critico') apenas_critico?: string,
  ): Promise<StreamableFile> {
    const { buffer, contentType, filename } = await this.relatorioService.exportarEstoque(
      { categoria_id, apenas_critico: apenas_critico === 'true' },
      formato as 'pdf' | 'xlsx' | 'csv',
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }

  @Get('lucratividade')
  @ApiQuery({ name: 'data_inicio', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'data_fim', required: false, example: '2026-12-31' })
  lucratividade(
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
  ) {
    return this.relatorioService.lucratividade({ data_inicio, data_fim });
  }

  @Get('lucratividade/exportar')
  @ApiQuery({ name: 'formato', required: false, enum: ['pdf', 'xlsx', 'csv'], example: 'pdf' })
  @ApiQuery({ name: 'data_inicio', required: false })
  @ApiQuery({ name: 'data_fim', required: false })
  async exportarLucratividade(
    @Res({ passthrough: true }) res: Response,
    @Query('formato') formato = 'pdf',
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
  ): Promise<StreamableFile> {
    const { buffer, contentType, filename } = await this.relatorioService.exportarLucratividade(
      { data_inicio, data_fim },
      formato as 'pdf' | 'xlsx' | 'csv',
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }
}
