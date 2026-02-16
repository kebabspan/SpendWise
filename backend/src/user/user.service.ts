import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      // Nem küldjük vissza a jelszót biztonsági okokból
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Felhasználó nem található');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const updateData: any = { ...dto };

    // Ha a felhasználó jelszót is akar módosítani
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
      },
    });
  }
}