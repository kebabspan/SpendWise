import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

function setupHealthCheck(app: INestApplication) {
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'warn', 'error'] });

  const config = new DocumentBuilder()
    .setTitle('SpendWise API')
    .setDescription('SpendWise backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  // CORS – localhost + helyi hálózat (LAN: 192.168.x.x, Docker: 172.x.x.x, VPN: 10.x.x.x)
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/(192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Healthcheck (a globális prefix előtt kell, ezért itt regisztráljuk)
  setupHealthCheck(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend:     http://localhost:${port}/api`);
  console.log(`Swagger:     http://localhost:${port}/api/docs`);
  console.log(`Healthcheck: http://localhost:${port}/api/health`);
}
bootstrap();
