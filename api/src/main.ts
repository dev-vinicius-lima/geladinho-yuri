import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer, ValidationError } from 'class-validator';
import { defaultErrorValidatorMessage } from './config/errors/validation-errors';
import { configSwagger } from './config/swagger';
import { httpCorsOptions } from './config/cors';
import { ResponseInterceptor } from './common/interceptors/ResponseInterceptor';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { setConfigMain } from './config/sctucture';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return defaultErrorValidatorMessage(errors);
      },
      stopAtFirstError: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // Prisma Exceptions
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  configSwagger(app);

  app.enableCors(httpCorsOptions);
  await app.listen(process.env.APP_PORT || 3000);
}
// eslint-disable-next-line
bootstrap();

setConfigMain();
