import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      // A sémád szerint ezek a kapcsolatnevek!
      include: { category: true, fromAccount: true, toAccount: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Tranzakció létrehozása
      const transaction = await tx.transaction.create({
        data: {
          amount: dto.amount,
          note: dto.description, // DTO-ból jön a description, de a sémában 'note'
          place: dto.place,
          type: dto.type as any, // Enum típusillesztés
          date: dto.date ? new Date(dto.date) : new Date(),
          userId,
          categoryId: dto.categoryId,
          fromAccountId: dto.accountId, // DTO-ból jön az accountId, de a sémában 'fromAccountId'
          toAccountId: dto.toAccountId,
        },
      });

      // 2. Egyenleg frissítés (EXPENSE vagy INCOME esetén is a fromAccountId-t nézzük a DTO-ból)
      if (dto.type === 'EXPENSE' && dto.accountId) {
        await tx.account.update({
          where: { id: dto.accountId },
          data: { balance: { decrement: dto.amount } },
        });
      } 
      else if (dto.type === 'INCOME' && dto.accountId) {
        await tx.account.update({
          where: { id: dto.accountId },
          data: { balance: { increment: dto.amount } },
        });
      } 
      else if (dto.type === 'TRANSFER' && dto.accountId && dto.toAccountId) {
        await tx.account.update({
          where: { id: dto.accountId },
          data: { balance: { decrement: dto.amount } },
        });
        await tx.account.update({
          where: { id: dto.toAccountId },
          data: { balance: { increment: dto.amount } },
        });
      } else {
        throw new BadRequestException('Hiányzó számla adatok a tranzakció típushoz!');
      }

      return transaction;
    });
  }

  async delete(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!transaction) throw new NotFoundException('Tranzakció nem található');

    return this.prisma.$transaction(async (tx) => {
      if (transaction.type === 'EXPENSE' && transaction.fromAccountId) {
        await tx.account.update({
          where: { id: transaction.fromAccountId },
          data: { balance: { increment: transaction.amount } },
        });
      } else if (transaction.type === 'INCOME' && transaction.fromAccountId) {
        await tx.account.update({
          where: { id: transaction.fromAccountId },
          data: { balance: { decrement: transaction.amount } },
        });
      }

      return tx.transaction.delete({ where: { id } });
    });
  }
}