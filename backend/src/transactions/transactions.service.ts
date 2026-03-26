import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transactions.dto';

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
      } else if (transaction.type === 'TRANSFER') {
        if (transaction.fromAccountId) {
          await tx.account.update({
            where: { id: transaction.fromAccountId },
            data: { balance: { increment: transaction.amount } },
          });
        }
        if (transaction.toAccountId) {
          await tx.account.update({
            where: { id: transaction.toAccountId },
            data: { balance: { decrement: transaction.amount } },
          });
        }
      }

      return tx.transaction.delete({ where: { id } });
    });
  }

  // PATCH: összeg, megjegyzés, helyszín, dátum, kategória módosítható
  // Ha összeg változik, visszavonjuk a régi egyenleghatást és alkalmazzuk az újat
  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw new NotFoundException('Tranzakció nem található');

    return this.prisma.$transaction(async (tx) => {
      // Ha összeg változik, egyenleg-korrekció szükséges
      if (dto.amount !== undefined && Number(dto.amount) !== Number(transaction.amount)) {
        const oldAmount = Number(transaction.amount);
        const newAmount = Number(dto.amount);
        const diff = newAmount - oldAmount; // pozitív = növekedés

        if (transaction.type === 'EXPENSE' && transaction.fromAccountId) {
          // EXPENSE: több összeg → több levonás (decrement)
          await tx.account.update({
            where: { id: transaction.fromAccountId },
            data: { balance: { decrement: diff } },
          });
        } else if (transaction.type === 'INCOME' && transaction.fromAccountId) {
          // INCOME: több összeg → több hozzáadás (increment)
          await tx.account.update({
            where: { id: transaction.fromAccountId },
            data: { balance: { increment: diff } },
          });
        } else if (transaction.type === 'TRANSFER') {
          if (transaction.fromAccountId) {
            await tx.account.update({
              where: { id: transaction.fromAccountId },
              data: { balance: { decrement: diff } },
            });
          }
          if (transaction.toAccountId) {
            await tx.account.update({
              where: { id: transaction.toAccountId },
              data: { balance: { increment: diff } },
            });
          }
        }
      }

      return tx.transaction.update({
        where: { id },
        data: {
          amount: dto.amount !== undefined ? dto.amount : undefined,
          note: dto.description !== undefined ? dto.description : undefined,
          place: dto.place !== undefined ? dto.place : undefined,
          date: dto.date ? new Date(dto.date) : undefined,
          categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
        },
        include: { category: true, fromAccount: true, toAccount: true },
      });
    });
  }
}
