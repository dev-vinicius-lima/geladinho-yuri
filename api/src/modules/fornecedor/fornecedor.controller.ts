import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { FornecedorService } from './fornecedor.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@ApiTags('Fornecedor')
@ApiBearerAuth('JWT-auth')
@Controller('fornecedor')
export class FornecedorController {
  constructor(private readonly service: FornecedorService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body() dto: CreateFornecedorDto,
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
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFornecedorDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  toggleStatus(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.service.toggleStatus(id, userId);
  }
}
