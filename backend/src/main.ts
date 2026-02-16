import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // A <NestExpressApplication> kell a setStaticAssets-hez (uploads mappa)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- Swagger (API Dokumentáció) Beállítása ---
  const config = new DocumentBuilder()
    .setTitle('Pénzügyi Tracker API')
    .setDescription('A backend alkalmazás teljes dokumentációja és tesztfelülete.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Másold be a bejelentkezéskor kapott access_token-t!',
        in: 'header',
      },
      'access-token', // Ez a név lesz a hivatkozási alap a kontrollereken (@ApiBearerAuth)
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Elérhető: http://localhost:3000/api/docs
  SwaggerModule.setup('api/docs', app, document);

  // --- Globális Beállítások ---
  
  // CORS: engedélyezzük a frontendnek (pl. Vite/React) az elérést
  app.enableCors({ origin: 'http://localhost:5173' });
  
  // Biztonságos leállás figyelése
  app.enableShutdownHooks();

  // Minden végpont 'api/' prefixszel fog kezdődni
  app.setGlobalPrefix('api');

  // Globális validáció a DTO-k alapján
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // Kiszedi a felesleges mezőket, amik nincsenek a DTO-ban
      transform: true,               // Automatikusan átalakítja a típusokat (pl. string -> number)
      forbidNonWhitelisted: true,    // Hibát dob, ha ismeretlen mező jön a kérésben
      transformOptions: {
        enableImplicitConversion: true, // Automatikus konverzió (pl. query paramétereknél)
      },
    }),
  );

  // --- Statikus fájlok kiszolgálása ---
  // Hozd létre az 'uploads' mappát a projekt gyökerében!
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Szerver indítása
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 A szerver fut: http://localhost:${port}/api`);
  console.log(`📖 API Dokumentáció: http://localhost:${port}/api/docs`);
}
bootstrap();