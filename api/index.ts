import express from 'express';
import serverlessExpress from '@codegenie/serverless-express';

let cachedServer: any;

async function bootstrap() {
  const { NestFactory } = await import('@nestjs/core');
  const { ExpressAdapter } = await import('@nestjs/platform-express');
  const { AppModule } = await import('../dist/app.module.js');
  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.init();

  return serverlessExpress({
    app: expressApp,
  });
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  return cachedServer(req, res);
}
