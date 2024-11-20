import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './core/interceptor/response-interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Initialize global pipes
  app.useGlobalPipes(new ValidationPipe());

  // Initialize global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger configuration
  app.use(
    '*/api',
    basicAuth({
      users: {
        admin: 'admin',
      },
      challenge: true,
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('User API')
    .setDescription('User Auth API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
