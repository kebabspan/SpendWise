import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

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
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsOptional()
  toAccountId?: string;
}

// Külön DTO a PATCH-hez: minden mező opcionális, nincs @IsNotEmpty() kényszer
export class UpdateTransactionDto {
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  place?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  toAccountId?: string;
}