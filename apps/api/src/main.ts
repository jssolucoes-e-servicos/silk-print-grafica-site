import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('SilkPrintBootstrap');
  
  // Cria aplicação NestJS baseada em Express
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  // Habilita CORS flexível para Storefront e ERP
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile apps, curl, postman) ou se listado
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // modo desenvolvimento permissivo
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Documentação Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Silk Print Gráfica - API REST')
    .setDescription('API central corporativa de alta volumetria para e-commerce e ERP gráfico')
    .setVersion('1.0.0')
    .addTag('Catálogo & Produtos', 'Endpoints públicos para a loja virtual')
    .addTag('Pedidos & Checkout', 'Processamento de compras, Pix, Cartão e Webhooks Mercado Pago')
    .addTag('Balcões de Retirada', 'Gestão e consulta de pontos de entrega')
    .addTag('Orçamentos & Leads', 'Cotações sob medida, WhatsApp e n8n')
    .addTag('Fábrica & PCP', 'Kanban de produção, matérias-primas e custos industriais')
    .addTag('Storage de Artes', 'Upload e presigned URLs no MinIO / S3')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Documentação da API - Silk Print Gráfica',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  logger.log(`🚀 Silk Print NestJS API rodando na porta ${port}`);
  logger.log(`📚 Documentação Swagger disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
