import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { CaixaService } from './caixa.service';
import { AbrirCaixaDto } from './dto/abrir-caixa.dto';
import { FecharCaixaDto } from './dto/fechar-caixa.dto';
import { MovimentacaoCaixaDto } from './dto/movimentacao-caixa.dto';

@ApiTags('Caixa')
@ApiBearerAuth('JWT-auth')
@Controller('caixa')
export class CaixaController {
  constructor(private readonly caixaService: CaixaService) {}

  @Post('abrir')
  abrir(
    @Body() dto: AbrirCaixaDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.caixaService.abrir(dto, userId);
  }

  @Post(':id/fechar')
  fechar(
    @Param('id') id: string,
    @Body() dto: FecharCaixaDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.caixaService.fechar(id, dto, userId);
  }

  @Get('aberto')
  getAberto(@GetCurrentUserId() userId: string) {
    return this.caixaService.getAberto(userId);
  }

  @Post(':id/sangria')
  sangria(
    @Param('id') id: string,
    @Body() dto: MovimentacaoCaixaDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.caixaService.sangria(id, dto, userId);
  }

  @Post(':id/suprimento')
  suprimento(
    @Param('id') id: string,
    @Body() dto: MovimentacaoCaixaDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.caixaService.suprimento(id, dto, userId);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  findAll(
    @GetCurrentUserId() userId: string,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '10',
  ) {
    return this.caixaService.findAll({ page: +page, pageSize: +pageSize, userId });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.caixaService.findOne(id, userId);
  }
}
