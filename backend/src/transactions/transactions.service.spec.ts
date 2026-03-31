import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';

const mockTxClient = {
  transaction: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  account: {
    update: jest.fn(),
  },
};

const mockPrisma = {
  transaction: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockTxClient)),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
    mockTxClient.transaction.create.mockResolvedValue({ id: 'tx-1' });
  });

  describe('create', () => {
    it('EXPENSE esetén csökkenti a forrásszámla egyenlegét', async () => {
      await service.create('user-1', {
        type: 'EXPENSE',
        amount: 5000,
        accountId: 'acc-1',
        description: 'Ebéd',
        place: null,
        date: null,
        categoryId: null,
        toAccountId: null,
      });

      expect(mockTxClient.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { balance: { decrement: 5000 } },
      });
    });

    it('INCOME esetén növeli a forrásszámla egyenlegét', async () => {
      await service.create('user-1', {
        type: 'INCOME',
        amount: 10000,
        accountId: 'acc-1',
        description: 'Fizetés',
        place: null,
        date: null,
        categoryId: null,
        toAccountId: null,
      });

      expect(mockTxClient.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { balance: { increment: 10000 } },
      });
    });

    it('TRANSFER esetén a forrásszámla csökken, a célszámla nő', async () => {
      await service.create('user-1', {
        type: 'TRANSFER',
        amount: 3000,
        accountId: 'acc-1',
        toAccountId: 'acc-2',
        description: null,
        place: null,
        date: null,
        categoryId: null,
      });

      expect(mockTxClient.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { balance: { decrement: 3000 } },
      });
      expect(mockTxClient.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-2' },
        data: { balance: { increment: 3000 } },
      });
    });

    it('TRANSFER célszámla nélkül BadRequestException-t dob', async () => {
      await expect(
        service.create('user-1', {
          type: 'TRANSFER',
          amount: 3000,
          accountId: 'acc-1',
          toAccountId: null,
          description: null,
          place: null,
          date: null,
          categoryId: null,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('nem létező tranzakció esetén NotFoundException-t dob', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.delete('user-1', 'nem-letezik')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('EXPENSE törlése visszaállítja a számlaegyenleget (increment)', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        type: 'EXPENSE',
        amount: 5000,
        fromAccountId: 'acc-1',
        toAccountId: null,
      });
      mockTxClient.transaction.delete.mockResolvedValue({ id: 'tx-1' });

      await service.delete('user-1', 'tx-1');

      expect(mockTxClient.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { balance: { increment: 5000 } },
      });
    });

    it('INCOME törlése visszaállítja a számlaegyenleget (decrement)', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-2',
        type: 'INCOME',
        amount: 10000,
        fromAccountId: 'acc-1',
        toAccountId: null,
      });
      mockTxClient.transaction.delete.mockResolvedValue({ id: 'tx-2' });

      await service.delete('user-1', 'tx-2');

      expect(mockTxClient.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { balance: { decrement: 10000 } },
      });
    });
  });
});
