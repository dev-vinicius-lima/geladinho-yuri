import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './modules/@global/globa.module';
import { MinioModule } from './modules/@global/minio/minio.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriaProdutoModule } from './modules/categoria-produto/categoria-produto.module';
import { ProdutoModule } from './modules/produto/produto.module';
import { CaixaModule } from './modules/caixa/caixa.module';
import { VendaModule } from './modules/venda/venda.module';
import { RelatorioModule } from './modules/relatorio/relatorio.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { PerfilModule } from './modules/perfil/perfil.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { EntradaEstoqueModule } from './modules/entrada-estoque/entrada-estoque.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { NotificacaoModule } from './modules/notificacao/notificacao.module';
import { AtGuard } from './modules/auth/guard/at.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GlobalModule,
    MinioModule,
    AuthModule,
    CategoriaProdutoModule,
    ProdutoModule,
    CaixaModule,
    VendaModule,
    RelatorioModule,
    UsuarioModule,
    PerfilModule,
    FornecedorModule,
    EntradaEstoqueModule,
    FinanceiroModule,
    NotificacaoModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_AUTH_USER,
          pass: process.env.MAIL_AUTH_PASS,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AtGuard },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
