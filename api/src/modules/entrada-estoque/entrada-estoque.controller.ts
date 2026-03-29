import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { EntradaEstoqueService } from './entrada-estoque.service';
import { CreateEntradaEstoqueDto } from './dto/create-entrada-estoque.dto';
import { UpdateEntradaEstoqueDto } from './dto/update-entrada-estoque.dto';

@ApiTags('Entrada Estoque')
@ApiBearerAuth('JWT-auth')
@Controller('entrada-estoque')
export class EntradaEstoqueController {
  constructor(private readonly entradaEstoqueService: EntradaEstoqueService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'fornecedor_id', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['rascunho', 'confirmada', 'cancelada'] })
  @ApiQuery({ name: 'data_inicio', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'data_fim', required: false, example: '2026-12-31' })
  findAll(
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '10',
    @Query('fornecedor_id') fornecedor_id?: string,
    @Query('status') status?: string,
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
  ) {
    return this.entradaEstoqueService.findAll({
      page: +page,
      pageSize: +pageSize,
      fornecedor_id,
      status,
      data_inicio,
      data_fim,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entradaEstoqueService.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body() dto: CreateEntradaEstoqueDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.entradaEstoqueService.create(dto, userId);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEntradaEstoqueDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.entradaEstoqueService.update(id, dto, userId);
  }

  @Post(':id/confirmar')
  @UseGuards(AdminGuard)
  confirmar(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.entradaEstoqueService.confirmar(id, userId);
  }

  @Post(':id/cancelar')
  @UseGuards(AdminGuard)
  cancelar(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.entradaEstoqueService.cancelar(id, userId);
  }
}
