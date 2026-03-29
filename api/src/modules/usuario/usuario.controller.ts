import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { BufferedFile } from 'src/modules/@global/minio/@types';
import type { ResponseMessage } from 'src/common/message/response-message';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangeSenhaDto } from './dto/change-senha.dto';
import { VincularPerfilDto } from './dto/vincular-perfil.dto';

@ApiTags('Usuários')
@ApiBearerAuth('JWT-auth')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateUsuarioDto, @GetCurrentUserId() userId: string) {
    return this.usuarioService.create(dto, userId);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  findAll(
    @Query('search') search?: string,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.usuarioService.findAll({
      search,
      page: +page,
      pageSize: +pageSize,
    });
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch('senha')
  changeSenha(@GetCurrentUserId() userId: string, @Body() dto: ChangeSenhaDto) {
    return this.usuarioService.changeSenha(userId, dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.usuarioService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  toggleStatus(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.usuarioService.toggleStatus(id, userId);
  }

  @Post(':id/perfil')
  @UseGuards(AdminGuard)
  vincularPerfil(
    @Param('id') usuarioId: string,
    @Body() dto: VincularPerfilDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.usuarioService.vincularPerfil(usuarioId, dto.perfil_id, userId);
  }

  @Delete(':id/perfil/:perfilId')
  @UseGuards(AdminGuard)
  desvincularPerfil(
    @Param('id') usuarioId: string,
    @Param('perfilId') perfilId: string,
  ) {
    return this.usuarioService.desvincularPerfil(usuarioId, perfilId);
  }

  @Patch('foto')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  uploadFoto(
    @GetCurrentUserId() userId: string,
    @UploadedFile() file: BufferedFile,
  ): Promise<ResponseMessage<{ imagem: string }>> {
    // minio 8.x / @types/minio 7.x type mismatch — return type is correct at runtime
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.usuarioService.uploadFoto(userId, file);
  }
}
