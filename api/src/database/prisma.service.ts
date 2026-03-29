/* eslint-disable */
import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      transactionOptions: {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
      },
    });
  }

  async onModuleInit() {
    await this.$connect();

    const prisma: any = this;
    Object.assign(
      this,
      this.$extends({
        query: {
          $allModels: {
            update({ model, args, query }) {
              const data = args.data as any;
              if (
                !prisma[model].fields.atualizado_em ||
                data?.atualizado_em !== undefined
              ) {
                return query(args);
              }
              const items = {
                ...args.data,
                atualizado_em: new Date(),
              };
              args.data = {
                ...items,
              };

              return query(args);
            },
            updateMany({ model, args, query }) {
              const data = args.data as any;
              if (
                !prisma[model].fields.atualizado_em ||
                data?.atualizado_em !== undefined
              ) {
                return query(args);
              }
              const items = {
                ...args.data,
                atualizado_em: new Date(),
              };
              args.data = {
                ...items,
              };
              return query(args);
            },
          },
        },
      }),
    );
  }

  async enableShutdownHooks(app: INestApplication) {
    // eslint-disable-next-line
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
