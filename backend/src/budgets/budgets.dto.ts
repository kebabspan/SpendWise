import { IsNotEmpty, IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  @IsNotEmpty()
  limitAmount: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  year: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

export class UpdateBudgetDto {
  @IsNumber()
  @IsOptional()
  limitAmount?: number;
}