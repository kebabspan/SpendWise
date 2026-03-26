import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

enum RecurringFrequency { DAILY='DAILY', WEEKLY='WEEKLY', MONTHLY='MONTHLY', YEARLY='YEARLY' }
enum TransactionType { EXPENSE='EXPENSE', INCOME='INCOME' }

export class CreateRecurringDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() amount: number;
  @IsEnum(TransactionType) type: TransactionType;
  @IsEnum(RecurringFrequency) frequency: RecurringFrequency;
  @IsDateString() nextDate: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() accountId?: string;
}

export class UpdateRecurringDto {
  @IsString() @IsOptional() name?: string;
  @IsNumber() @IsOptional() amount?: number;
  @IsEnum(RecurringFrequency) @IsOptional() frequency?: RecurringFrequency;
  @IsDateString() @IsOptional() nextDate?: string;
  @IsBoolean() @IsOptional() active?: boolean;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() accountId?: string;
}
