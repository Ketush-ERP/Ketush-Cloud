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

export class CreateInitialPaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  receivedAt?: Date;

  @IsString()
  @IsOptional()
  bankId?: string;

  @IsString()
  @IsOptional()
  cardId?: string;
}
