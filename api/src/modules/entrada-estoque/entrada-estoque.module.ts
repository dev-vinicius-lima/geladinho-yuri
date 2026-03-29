import { Module } from '@nestjs/common';
import { EntradaEstoqueController } from './entrada-estoque.controller';
import { EntradaEstoqueService } from './entrada-estoque.service';

@Module({
  controllers: [EntradaEstoqueController],
  providers: [EntradaEstoqueService],
})
export class EntradaEstoqueModule {}
