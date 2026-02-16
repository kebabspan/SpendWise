import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // A végére tett felkiáltójel mondja meg a TS-nek, hogy "nyugi, ott lesz az"
        secret: config.get<string>('JWT_SECRET')!, 
        signOptions: {
          // Itt pedig kényszerítjük a típust, hogy elfogadja stringként
          expiresIn: config.get<string>('JWT_EXPIRES_IN') as any || '7d',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}