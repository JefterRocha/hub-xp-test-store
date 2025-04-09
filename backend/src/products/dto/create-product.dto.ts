import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  price: string;

  @IsArray()
  categoryIds: string[];

  @IsString()
  @IsOptional()
  imageUrl?: string;
}