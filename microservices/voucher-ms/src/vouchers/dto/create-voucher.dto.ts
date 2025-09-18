import { Currency } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VoucherProductItemDto } from './voucher-product-item.dto';
import { CreateInitialPaymentDto } from './initial-payment.dto';
import { VoucherType } from 'src/enum';

export class CreateVoucherDto {
  @IsNumber()
  @IsPositive()
  cuil: number;

  @IsNumber()
  @IsOptional()
  pointOfSale: number; // Nuevo campo para punto de venta

  @IsNumber()
  @IsOptional()
  voucherNumber: number; // Nuevo campo para número secuencial

  @IsEnum(VoucherType)
  type: VoucherType;

  @IsDate()
  @Type(() => Date)
  emissionDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate: Date;

  @IsString()
  @IsOptional()
  contactId: string;

  @IsEnum(Currency)
  currency: Currency;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VoucherProductItemDto)
  products: VoucherProductItemDto[];

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  totalAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  paidAmount: number;

  @IsString()
  @IsOptional()
  observation: string;

  @IsBoolean()
  @IsOptional()
  available: boolean;

  @IsBoolean()
  loadToArca: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInitialPaymentDto)
  initialPayment: CreateInitialPaymentDto[];

  @IsNumber()
  @IsOptional()
  associatedVoucherNumber: number;

  @IsEnum(VoucherType)
  @IsOptional()
  associatedVoucherType: VoucherType;
}
