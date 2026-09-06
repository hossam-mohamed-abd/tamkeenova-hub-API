import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { TestModule } from './modules/test/test.module';

import { AppController } from './app.controller';

import { TrainersModule } from './modules/trainers/trainers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,

    AuthModule,

    MailModule,

    TrainersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
