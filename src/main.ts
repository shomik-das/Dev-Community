import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); //data integrity
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalInterceptors(new LoggerInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
