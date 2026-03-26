import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGoalDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() targetAmount: number;
  @IsNumber() @IsOptional() savedAmount?: number;
  @IsDateString() @IsOptional() deadline?: string;
  @IsString() @IsOptional() color?: string;
  @IsString() @IsOptional() icon?: string;
}

export class UpdateGoalDto {
  @IsString() @IsOptional() name?: string;
  @IsNumber() @IsOptional() targetAmount?: number;
  @IsNumber() @IsOptional() savedAmount?: number;
  @IsDateString() @IsOptional() deadline?: string;
  @IsString() @IsOptional() color?: string;
}

export class AddToGoalDto {
  @IsNumber() @IsNotEmpty() amount: number;
}
