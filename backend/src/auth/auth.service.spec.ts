import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed-password',
  name: 'Test User',
  currency: 'HUF',
  imageUrl: null,
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('érvényes adatokkal létrehozza a felhasználót és tokent ad vissza', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        currency: 'HUF',
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('már létező e-mail esetén BadRequestException-t dob', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          currency: 'HUF',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('a jelszót nem plain text-ként tárolja el', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        currency: 'HUF',
      });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe('password123');
    });
  });

  describe('login', () => {
    it('helyes adatokkal tokent ad vissza', async () => {
      const hashedPw = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashedPw });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('nem létező e-mail esetén UnauthorizedException-t dob', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rossz jelszó esetén UnauthorizedException-t dob', async () => {
      const hashedPw = await bcrypt.hash('helyes-jelszo', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashedPw });

      await expect(
        service.login({ email: 'test@example.com', password: 'rossz-jelszo' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
