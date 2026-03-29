import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { CategoriaProdutoService } from './categoria-produto.service';
import { CreateCategoriaProdutoDto } from './dto/create-categoria-produto.dto';
import { UpdateCategoriaProdutoDto } from './dto/update-categoria-produto.dto';

@ApiTags('Categoria de Produto')
@ApiBearerAuth('JWT-auth')
@Controller('categoria-produto')
export class CategoriaProdutoController {
  constructor(private readonly service: CategoriaProdutoService) {}

  @Post()
  create(
    @Body() dto: CreateCategoriaProdutoDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  findAll(
    @Query('search') search?: string,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.service.findAll({ search, page: +page, pageSize: +pageSize });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoriaProdutoDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Patch(':id/status')
  toggleStatus(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.service.toggleStatus(id, userId);
  }
}
