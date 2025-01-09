import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@common/filters/http-exception.filter';
import 'tsconfig-paths/register';

/**
 * Bootstraps the NestJS application.
 *
 * This function performs the following tasks:
 * - Creates the NestJS application instance.
 * - Retrieves configuration settings using ConfigService.
 * - Configures Cross-Origin Resource Sharing (CORS) with dynamic origins.
 * - Sets a global prefix for all API routes.
 * - Applies compression middleware to optimize response sizes.
 * - Starts the application server on the specified port.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string>('CORS_ORIGIN').split(',');

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Cache-Control',
    credentials: true,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
