import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  readonly isRedisNotActive = process.env.QUEUE_ENABLED === 'false';

  constructor() {
    super({
      host: process.env.REDIS_HOST || undefined,
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    if (this.isRedisNotActive) {
      this.onModuleDestroy();
    }

    this.on('connect', () => this.logger.log('Redis conectando...'));
    this.on('ready', () => this.logger.log('Redis conectado!'));
    this.on('error', (error) => this.logger.error('Erro no Redis', error));
    this.on('close', () => this.logger.warn('Redis desconectado!'));
    this.on('reconnecting', () => this.logger.log('Redis reconectando!'));
    this.on('end', () => this.logger.warn('Conexão com Redis encerrada!'));
  }

  onModuleDestroy() {
    this.disconnect(false);
  }

  fullItemsQueue(queueName: string) {
    return this.lrange(queueName, 0, -1);
  }
}
