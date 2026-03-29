import { Body, Controller, Get, Param, Patch, Post, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { CreateVendaDto } from './dto/create-venda.dto';
import { VendaService } from './venda.service';

@ApiTags('Venda')
@ApiBearerAuth('JWT-auth')
@Controller('venda')
export class VendaController {
  constructor(private readonly vendaService: VendaService) {}

  @Post()
  create(
    @Body() dto: CreateVendaDto,
    @GetCurrentUserId() usuarioId: string,
  ) {
    return this.vendaService.create(dto, usuarioId);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['concluida', 'cancelada'] })
  @ApiQuery({ name: 'forma_pagamento', required: false })
  @ApiQuery({ name: 'data_inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'data_fim', required: false, example: '2025-12-31' })
  @ApiQuery({ name: 'caixa_id', required: false })
  findAll(
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '20',
    @Query('status') status?: string,
    @Query('forma_pagamento') forma_pagamento?: string,
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
    @Query('caixa_id') caixa_id?: string,
  ) {
    return this.vendaService.findAll({
      page: +page,
      pageSize: +pageSize,
      status,
      forma_pagamento,
      data_inicio,
      data_fim,
      caixa_id,
    });
  }

  @Get('dashboard')
  getDashboard(@GetCurrentUserId() usuarioId: string) {
    return this.vendaService.getDashboard(usuarioId);
  }

  @Get('recentes')
  getRecentes() {
    return this.vendaService.getRecentes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendaService.findOne(id);
  }

  @Get('exportar')
  @ApiQuery({ name: 'formato', required: false, enum: ['xlsx', 'csv', 'pdf'], example: 'xlsx' })
  @ApiQuery({ name: 'status', required: false, enum: ['concluida', 'cancelada'] })
  @ApiQuery({ name: 'forma_pagamento', required: false })
  @ApiQuery({ name: 'data_inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'data_fim', required: false, example: '2025-12-31' })
  @ApiQuery({ name: 'caixa_id', required: false })
  async exportar(
    @Res({ passthrough: true }) res: Response,
    @Query('formato') formato = 'xlsx',
    @Query('status') status?: string,
    @Query('forma_pagamento') forma_pagamento?: string,
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
    @Query('caixa_id') caixa_id?: string,
  ): Promise<StreamableFile> {
    const { buffer, contentType, filename } = await this.vendaService.exportar(
      { status, forma_pagamento, data_inicio, data_fim, caixa_id },
      formato as 'pdf' | 'xlsx' | 'csv',
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }

  @Patch(':id/cancelar')
  cancelar(
    @Param('id') id: string,
    @GetCurrentUserId() usuarioId: string,
  ) {
    return this.vendaService.cancelar(id, usuarioId);
  }
}
