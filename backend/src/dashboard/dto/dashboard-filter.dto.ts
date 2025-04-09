import { IsString, IsOptional, IsDateString } from 'class-validator';

export class DashboardFilterDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  period?: 'daily' | 'weekly' | 'monthly';
}