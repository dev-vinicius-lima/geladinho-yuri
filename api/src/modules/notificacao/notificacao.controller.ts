import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { NotificacaoService } from './notificacao.service';

@ApiTags('Notificacao')
@ApiBearerAuth('JWT-auth')
@Controller('notificacao')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  findAll(
    @GetCurrentUserId() userId: string,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.notificacaoService.findAll({
      userId,
      page: +page,
      pageSize: +pageSize,
    });
  }

  @Get('count')
  countNaoLidas(@GetCurrentUserId() userId: string) {
    return this.notificacaoService.countNaoLidas(userId);
  }

  @Patch('todas/lidas')
  marcarTodasComoLidas(@GetCurrentUserId() userId: string) {
    return this.notificacaoService.marcarTodasComoLidas(userId);
  }

  @Patch(':id/lida')
  marcarComoLida(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.notificacaoService.marcarComoLida(id, userId);
  }
}
