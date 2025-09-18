import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateBankDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  account?: string;

  @IsString()
  @IsOptional()
  cbu?: string;

  @IsEnum(Currency)
  currency: Currency;

  @IsBoolean()
  @IsOptional()
  available: boolean;
}
