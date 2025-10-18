import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  async onModuleInit() {
    await this.$connect(); // conecta ao banco quando o módulo inicia
  }

  async onModuleDestroy() {
    await this.$disconnect(); // desconecta ao destruir o módulo
  }
}
