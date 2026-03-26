import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './goals.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        name: dto.name,
        targetAmount: dto.targetAmount,
        savedAmount: dto.savedAmount ?? 0,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        color: dto.color,
        icon: dto.icon,
        userId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Cél nem található');
    return this.prisma.goal.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async addAmount(userId: string, id: string, amount: number) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Cél nem található');
    return this.prisma.goal.update({
      where: { id },
      data: { savedAmount: { increment: amount } },
    });
  }

  async delete(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Cél nem található');
    return this.prisma.goal.delete({ where: { id } });
  }
}
