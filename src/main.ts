import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Cho phép CORS để React Frontend gọi API dễ dàng
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Thiết lập tiền tố toàn cục /api cho tất cả REST API endpoints
  app.setGlobalPrefix('api');

  // Tự động kiểm tra và chuyển đổi dữ liệu (Validation DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Cấu hình Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ToDo List REST API')
    .setDescription('API cho ứng dụng ToDo List (NestJS + MongoDB + AWS Ready)')
    .setVersion('1.0')
    .addTag('todos', 'Quản lý các công việc')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Backend NestJS đang chạy tại: http://localhost:${port}`);
  logger.log(`📚 Swagger API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
