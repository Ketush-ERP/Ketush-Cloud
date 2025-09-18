// import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  public code: string;

  @IsString()
  public description: string;

  @IsString()
  public price: string;

  @IsString()
  @IsOptional()
  public brandId: string;

  @IsString()
  public supplierId: string;

  @IsBoolean()
  @IsOptional()
  public available: boolean;
}
