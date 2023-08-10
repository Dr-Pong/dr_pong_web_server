import { NestFactory } from '@nestjs/core';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  initializeTransactionalContext();
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.GATEWAY_URL],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(4444);
}
bootstrap();
