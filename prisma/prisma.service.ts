import { Injectable, INestApplication, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.$connect();
  }

  // Removido async do método para não quebrar ESLint
  enableShutdownHooks(app: INestApplication) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
