import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringDto, UpdateRecurringDto } from './recurring.dto';

@Injectable()
export class RecurringService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.recurringTransaction.findMany({
      where: { userId },
      include: { category: true, account: true },
      orderBy: { nextDate: 'asc' },
    });
  }

  create(userId: string, dto: CreateRecurringDto) {
    return this.prisma.recurringTransaction.create({
      data: {
        name: dto.name,
        amount: dto.amount,
        type: dto.type as any,
        frequency: dto.frequency as any,
        nextDate: new Date(dto.nextDate),
        categoryId: dto.categoryId,
        accountId: dto.accountId,
        userId,
      },
      include: { category: true, account: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateRecurringDto) {
    const r = await this.prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!r) throw new NotFoundException();
    return this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...dto,
        nextDate: dto.nextDate ? new Date(dto.nextDate) : undefined,
        frequency: dto.frequency as any,
      },
      include: { category: true, account: true },
    });
  }

  async delete(userId: string, id: string) {
    const r = await this.prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!r) throw new NotFoundException();
    return this.prisma.recurringTransaction.delete({ where: { id } });
  }

  /** Feldolgozza az összes esedékes ismétlődő tranzakciót:
   *  - Létrehozza a valós tranzakciót és frissíti a számlaegyenleget
   *  - Lépteti a nextDate-t a következő esedékességre
   */
  async processRecurring(userId: string): Promise<{ processed: number }> {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const dueItems = await this.prisma.recurringTransaction.findMany({
      where: { userId, active: true, nextDate: { lte: todayEnd } },
    });

    let processed = 0;

    for (const item of dueItems) {
      let nextDate = new Date(item.nextDate);

      // Az összes esedékes dátumot végigfutjuk (pl. ha több hónap is kimaradt)
      while (nextDate <= todayEnd) {
        if (item.accountId) {
          await this.prisma.$transaction(async (tx) => {
            await tx.transaction.create({
              data: {
                amount: Number(item.amount),
                note: `Ismétlődő: ${item.name}`,
                type: item.type,
                date: new Date(nextDate),
                userId,
                categoryId: item.categoryId ?? undefined,
                fromAccountId: item.accountId,
              },
            });

            if (item.type === 'EXPENSE' && item.accountId) {
              await tx.account.update({
                where: { id: item.accountId ?? undefined },
                data: { balance: { decrement: Number(item.amount) } },
              });
            } else if (item.type === 'INCOME' && item.accountId) {
              await tx.account.update({
                where: { id: item.accountId ?? undefined },
                data: { balance: { increment: Number(item.amount) } },
              });
            }
          });
          processed++;
        }

        nextDate = this.advanceDate(nextDate, item.frequency as string);
      }

      // Frissítjük a következő esedékességet
      await this.prisma.recurringTransaction.update({
        where: { id: item.id },
        data: { nextDate },
      });
    }

    return { processed };
  }

  private advanceDate(date: Date, frequency: string): Date {
    const next = new Date(date);
    switch (frequency) {
      case 'DAILY':   next.setDate(next.getDate() + 1); break;
      case 'WEEKLY':  next.setDate(next.getDate() + 7); break;
      case 'MONTHLY': next.setMonth(next.getMonth() + 1); break;
      case 'YEARLY':  next.setFullYear(next.getFullYear() + 1); break;
    }
    return next;
  }
}
