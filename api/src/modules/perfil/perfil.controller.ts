import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { PerfilService } from './perfil.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@ApiTags('Perfis')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Post()
  create(@Body() dto: CreatePerfilDto, @GetCurrentUserId() userId: string) {
    return this.perfilService.create(dto, userId);
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
    return this.perfilService.findAll({ search, page: +page, pageSize: +pageSize });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePerfilDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.perfilService.update(id, dto, userId);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.perfilService.toggleStatus(id, userId);
  }
}
