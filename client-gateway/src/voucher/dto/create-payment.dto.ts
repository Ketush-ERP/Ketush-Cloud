// create-payment.dto.ts
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Currency } from 'src/enum';
import { PaymentMethod } from 'src/enum/payment-method.enum';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsPositive()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  exchangeRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  originalAmount?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  receivedAt?: Date;

  @IsOptional()
  @IsString()
  receivedBy?: string;

  @IsOptional()
  @IsString()
  bankId?: string;

  @IsOptional()
  @IsString()
  cardId: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  chequeDueDate?: Date;

  @IsOptional()
  @IsString()
  chequeStatus?: string;

  @IsString()
  voucherId: string;
}
