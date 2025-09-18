import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class VoucherProductItemDto {
  @IsString()
  productId: string;

  @IsString()
  description: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  voucherId?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;
}

export class UpdateVoucherProductItemDto {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  voucherId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  price?: number;
}
