import { Module } from '@nestjs/common';
import { VendaController } from './venda.controller';
import { VendaService } from './venda.service';

@Module({
  controllers: [VendaController],
  providers: [VendaService],
})
export class VendaModule {}
