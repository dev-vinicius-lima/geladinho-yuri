import { Module } from '@nestjs/common';
import { CategoriaProdutoController } from './categoria-produto.controller';
import { CategoriaProdutoService } from './categoria-produto.service';

@Module({
  controllers: [CategoriaProdutoController],
  providers: [CategoriaProdutoService],
})
export class CategoriaProdutoModule {}
