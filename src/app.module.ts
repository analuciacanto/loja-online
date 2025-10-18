import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module'; // importando seu módulo de usuários
import { PrismaModule } from '../prisma/prisma.module'; // se você tiver um módulo Prisma

@Module({
 imports: [
    PrismaModule, // garante que PrismaService pode ser injetado
    UsersModule,  // registra o UsersModule no projeto
  ],  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
