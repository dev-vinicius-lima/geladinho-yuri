import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificacaoController } from './notificacao.controller';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoScheduler } from './notificacao.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificacaoController],
  providers: [NotificacaoService, NotificacaoScheduler],
  exports: [NotificacaoService],
})
export class NotificacaoModule {}
