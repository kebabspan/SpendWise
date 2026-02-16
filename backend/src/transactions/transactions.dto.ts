import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string; // Átnevezve 'note'-ról, hogy egyezzen a kéréseddel

  @IsString()
  @IsOptional()
  place?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsNotEmpty() // Ez kötelező, mert tudnunk kell, melyik számlát módosítjuk
  accountId: string; // Átnevezve 'fromAccountId'-ról az egyszerűség kedvéért

  @IsString()
  @IsOptional()
  toAccountId?: string; // Csak TRANSFER esetén kellhet
}