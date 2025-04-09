import { IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  productIds: string[];
}