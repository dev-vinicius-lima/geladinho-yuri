import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { MovimentacaoEstoqueDto } from './dto/movimentacao-estoque.dto';

@ApiTags('Produto')
@ApiBearerAuth('JWT-auth')
@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Post()
  create(
    @Body() dto: CreateProdutoDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.produtoService.create(dto, userId);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoria_id', required: false })
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiQuery({ name: 'estoque_critico', required: false, type: Boolean })
  findAll(
    @Query('search') search?: string,
    @Query('categoria_id') categoria_id?: string,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '20',
    @Query('estoque_critico') estoque_critico?: string,
  ) {
    return this.produtoService.findAll({
      search,
      categoria_id,
      page: +page,
      pageSize: +pageSize,
      estoque_critico: estoque_critico === 'true',
    });
  }

  @Get('exportar')
  @ApiQuery({ name: 'formato', required: false, enum: ['xlsx', 'csv', 'pdf'], example: 'xlsx' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoria_id', required: false })
  async exportar(
    @Res({ passthrough: true }) res: Response,
    @Query('formato') formato = 'xlsx',
    @Query('search') search?: string,
    @Query('categoria_id') categoria_id?: string,
  ): Promise<StreamableFile> {
    const { buffer, contentType, filename } = await this.produtoService.exportar(
      { search, categoria_id },
      formato as 'pdf' | 'xlsx' | 'csv',
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProdutoDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.produtoService.update(id, dto, userId);
  }

  @Patch(':id/status')
  toggleStatus(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.produtoService.toggleStatus(id, userId);
  }

  @Post(':id/movimentacao')
  movimentarEstoque(
    @Param('id') id: string,
    @Body() dto: MovimentacaoEstoqueDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.produtoService.movimentarEstoque(id, dto, userId);
  }

  @Get(':id/movimentacao')
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  getMovimentacoes(
    @Param('id') id: string,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.produtoService.getMovimentacoes(id, { page: +page, pageSize: +pageSize });
  }
}
