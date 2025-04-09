import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsArray()
  @IsOptional()
  productIds?: string[];

  @IsNumber()
  @IsOptional()
  total?: number;
}