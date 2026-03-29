import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/database/prisma.service';
import { format, subHours, addDays } from 'date-fns';

@Injectable()
export class NotificacaoScheduler {
  private readonly logger = new Logger(NotificacaoScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async gerarNotificacoes() {
    this.logger.log('Iniciando geração de notificações automáticas...');

    await Promise.allSettled([
      this.verificarEstoqueCritico(),
      this.verificarCaixaAbertoLongo(),
      this.verificarContasVencendo(),
      this.verificarContasVencidas(),
    ]);

    this.logger.log('Geração de notificações concluída.');
  }

  /**
   * Estoque crítico: produtos com quantidade <= estoque_minimo
   * Cria notificação para todos os administradores
   */
  private async verificarEstoqueCritico() {
    try {
      // Busca todos os produtos ativos (filtro em memória — Prisma não compara colunas)
      const produtos = await this.prisma.produto.findMany({
        where: { ativo: true },
        select: { id: true, nome: true, quantidade: true, estoque_minimo: true },
      });

      const produtosCriticos = produtos.filter(
        (p) => p.quantidade <= p.estoque_minimo,
      );

      if (produtosCriticos.length === 0) return;

      const agora = new Date();
      const limite24h = subHours(agora, 24);

      const admins = await this.buscarAdministradores();
      if (admins.length === 0) return;

      for (const produto of produtosCriticos) {
        // Verifica se já existe notificação nas últimas 24h para esse produto
        const existente = await this.prisma.notificacao.findFirst({
          where: {
            tipo: 'estoque_critico',
            referencia_tipo: 'produto',
            referencia_id: produto.id,
            criado_em: { gte: limite24h },
          },
        });

        if (existente) continue;

        // Cria notificação para cada administrador
        const dados = admins.map((admin) => ({
          usuario_id: admin.id,
          tipo: 'estoque_critico',
          titulo: `Estoque crítico: ${produto.nome}`,
          mensagem: `O produto ${produto.nome} está com ${produto.quantidade} unidades (mínimo: ${produto.estoque_minimo})`,
          referencia_tipo: 'produto',
          referencia_id: produto.id,
        }));

        await this.prisma.notificacao.createMany({ data: dados });
      }

      this.logger.log(
        `Estoque crítico: ${produtosCriticos.length} produto(s) verificado(s)`,
      );
    } catch (error) {
      this.logger.error('Erro ao verificar estoque crítico', error);
    }
  }

  /**
   * Caixa aberto há mais de 12 horas
   * Cria notificação para o dono do caixa
   */
  private async verificarCaixaAbertoLongo() {
    try {
      const agora = new Date();
      const limite12h = subHours(agora, 12);
      const limite24h = subHours(agora, 24);

      const caixas = await this.prisma.caixa.findMany({
        where: {
          status: 'aberto',
          aberto_em: { lt: limite12h },
        },
        select: { id: true, usuario_id: true, aberto_em: true },
      });

      if (caixas.length === 0) return;

      for (const caixa of caixas) {
        // Verifica duplicidade nas últimas 24h
        const existente = await this.prisma.notificacao.findFirst({
          where: {
            tipo: 'caixa_aberto_longo',
            referencia_tipo: 'caixa',
            referencia_id: caixa.id,
            criado_em: { gte: limite24h },
          },
        });

        if (existente) continue;

        const dataFormatada = format(caixa.aberto_em, 'dd/MM/yyyy HH:mm');

        await this.prisma.notificacao.create({
          data: {
            usuario_id: caixa.usuario_id,
            tipo: 'caixa_aberto_longo',
            titulo: 'Caixa aberto há muito tempo',
            mensagem: `Seu caixa está aberto desde ${dataFormatada}. Considere fechar.`,
            referencia_tipo: 'caixa',
            referencia_id: caixa.id,
          },
        });
      }

      this.logger.log(
        `Caixa aberto longo: ${caixas.length} caixa(s) verificado(s)`,
      );
    } catch (error) {
      this.logger.error('Erro ao verificar caixas abertos', error);
    }
  }

  /**
   * Contas vencendo nos próximos 3 dias
   * Cria notificação para todos os administradores
   */
  private async verificarContasVencendo() {
    try {
      const agora = new Date();
      const daqui3Dias = addDays(agora, 3);
      const limite24h = subHours(agora, 24);

      const contas = await this.prisma.conta_financeira.findMany({
        where: {
          pago_em: null,
          ativo: true,
          vencimento: { gte: agora, lte: daqui3Dias },
        },
        select: { id: true, descricao: true, valor: true, vencimento: true },
      });

      if (contas.length === 0) return;

      const admins = await this.buscarAdministradores();
      if (admins.length === 0) return;

      for (const conta of contas) {
        const existente = await this.prisma.notificacao.findFirst({
          where: {
            tipo: 'conta_vencendo',
            referencia_tipo: 'conta_financeira',
            referencia_id: conta.id,
            criado_em: { gte: limite24h },
          },
        });

        if (existente) continue;

        const vencimentoFormatado = format(conta.vencimento, 'dd/MM/yyyy');
        const valorFormatado = Number(conta.valor).toFixed(2);

        const dados = admins.map((admin) => ({
          usuario_id: admin.id,
          tipo: 'conta_vencendo',
          titulo: `Conta vencendo: ${conta.descricao}`,
          mensagem: `A conta "${conta.descricao}" de R$ ${valorFormatado} vence em ${vencimentoFormatado}`,
          referencia_tipo: 'conta_financeira',
          referencia_id: conta.id,
        }));

        await this.prisma.notificacao.createMany({ data: dados });
      }

      this.logger.log(
        `Contas vencendo: ${contas.length} conta(s) verificada(s)`,
      );
    } catch (error) {
      this.logger.error('Erro ao verificar contas vencendo', error);
    }
  }

  /**
   * Contas vencidas (vencimento no passado e não pagas)
   * Cria notificação para todos os administradores
   */
  private async verificarContasVencidas() {
    try {
      const agora = new Date();
      const limite24h = subHours(agora, 24);

      const contas = await this.prisma.conta_financeira.findMany({
        where: {
          pago_em: null,
          ativo: true,
          vencimento: { lt: agora },
        },
        select: { id: true, descricao: true, valor: true, vencimento: true },
      });

      if (contas.length === 0) return;

      const admins = await this.buscarAdministradores();
      if (admins.length === 0) return;

      for (const conta of contas) {
        const existente = await this.prisma.notificacao.findFirst({
          where: {
            tipo: 'conta_vencida',
            referencia_tipo: 'conta_financeira',
            referencia_id: conta.id,
            criado_em: { gte: limite24h },
          },
        });

        if (existente) continue;

        const vencimentoFormatado = format(conta.vencimento, 'dd/MM/yyyy');
        const valorFormatado = Number(conta.valor).toFixed(2);

        const dados = admins.map((admin) => ({
          usuario_id: admin.id,
          tipo: 'conta_vencida',
          titulo: `Conta vencida: ${conta.descricao}`,
          mensagem: `A conta "${conta.descricao}" de R$ ${valorFormatado} venceu em ${vencimentoFormatado}`,
          referencia_tipo: 'conta_financeira',
          referencia_id: conta.id,
        }));

        await this.prisma.notificacao.createMany({ data: dados });
      }

      this.logger.log(
        `Contas vencidas: ${contas.length} conta(s) verificada(s)`,
      );
    } catch (error) {
      this.logger.error('Erro ao verificar contas vencidas', error);
    }
  }

  /**
   * Busca todos os usuarios administradores ativos
   */
  private async buscarAdministradores() {
    return this.prisma.usuario.findMany({
      where: { administrador: true, ativo: true },
      select: { id: true },
    });
  }
}
