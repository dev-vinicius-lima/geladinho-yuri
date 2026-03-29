import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { FinanceiroService } from './financeiro.service';
import { CreateCategoriaFinanceiraDto } from './dto/create-categoria-financeira.dto';
import { CreateContaFinanceiraDto } from './dto/create-conta-financeira.dto';
import { UpdateContaFinanceiraDto } from './dto/update-conta-financeira.dto';
import { PagarContaDto } from './dto/pagar-conta.dto';

@ApiTags('Financeiro')
@ApiBearerAuth('JWT-auth')
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  // ─── CATEGORIAS ──────────────────────────────────────────────────────────────

  @Get('categorias')
  findAllCategorias() {
    return this.financeiroService.findAllCategorias();
  }

  @Post('categorias')
  @UseGuards(AdminGuard)
  createCategoria(@Body() dto: CreateCategoriaFinanceiraDto) {
    return this.financeiroService.createCategoria(dto);
  }

  // ─── CONTAS ──────────────────────────────────────────────────────────────────

  @Get('contas')
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiQuery({ name: 'tipo', required: false, enum: ['pagar', 'receber'] })
  @ApiQuery({ name: 'status', required: false, enum: ['pendente', 'paga', 'vencida'] })
  @ApiQuery({ name: 'vencimento_inicio', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'vencimento_fim', required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'categoria_financeira_id', required: false })
  findAllContas(
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '20',
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
    @Query('vencimento_inicio') vencimento_inicio?: string,
    @Query('vencimento_fim') vencimento_fim?: string,
    @Query('categoria_financeira_id') categoria_financeira_id?: string,
  ) {
    return this.financeiroService.findAllContas({
      page: +page,
      pageSize: +pageSize,
      tipo,
      status,
      vencimento_inicio,
      vencimento_fim,
      categoria_financeira_id,
    });
  }

  @Get('contas/:id')
  findOneConta(@Param('id') id: string) {
    return this.financeiroService.findOneConta(id);
  }

  @Post('contas')
  @UseGuards(AdminGuard)
  createConta(
    @Body() dto: CreateContaFinanceiraDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.financeiroService.createConta(dto, userId);
  }

  @Patch('contas/:id')
  @UseGuards(AdminGuard)
  updateConta(
    @Param('id') id: string,
    @Body() dto: UpdateContaFinanceiraDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.financeiroService.updateConta(id, dto, userId);
  }

  @Patch('contas/:id/pagar')
  @UseGuards(AdminGuard)
  pagarConta(
    @Param('id') id: string,
    @Body() dto: PagarContaDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.financeiroService.pagarConta(id, dto, userId);
  }

  @Delete('contas/:id')
  @UseGuards(AdminGuard)
  removeConta(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.financeiroService.removeConta(id, userId);
  }

  // ─── RELATÓRIOS ──────────────────────────────────────────────────────────────

  @Get('resumo')
  resumo() {
    return this.financeiroService.resumo();
  }

  @Get('fluxo-caixa')
  @ApiQuery({ name: 'data_inicio', required: true, example: '2026-03-01' })
  @ApiQuery({ name: 'data_fim', required: true, example: '2026-03-31' })
  fluxoCaixa(
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
  ) {
    return this.financeiroService.fluxoCaixa({ data_inicio, data_fim });
  }

  @Get('dre')
  @ApiQuery({ name: 'data_inicio', required: true, example: '2026-03-01' })
  @ApiQuery({ name: 'data_fim', required: true, example: '2026-03-31' })
  dre(
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
  ) {
    return this.financeiroService.dre({ data_inicio, data_fim });
  }
}
