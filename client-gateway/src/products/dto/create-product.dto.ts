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
  @IsOptional()
  public price: string;

  @IsString()
  @IsOptional()
  public brandId: string;

  @IsString()
  @IsOptional()
  public supplierId: string;

  @IsBoolean()
  @IsOptional()
  public available: boolean;
}

export class CreateProductsFileDto {
  @IsString()
  public code: string;

  @IsString()
  public description: string;

  @IsString()
  @IsOptional()
  public price: string;
}
