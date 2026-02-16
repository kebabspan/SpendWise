import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './budgets.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });
  }

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        limitAmount: dto.limitAmount,
        month: dto.month,
        year: dto.year,
        userId: userId,
        categoryId: dto.categoryId,
      },
    });
  }

  async delete(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!budget) throw new NotFoundException('Költségkeret nem található');

    return this.prisma.budget.delete({ where: { id } });
  }
}