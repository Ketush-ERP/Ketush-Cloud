import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { IvaCondition } from 'src/enum/iva-condition.enum';
import { VoucherType } from 'src/enum/voucher-type.enum';

export class CreateVocuherDto {
  @IsNumber()
  @IsPositive()
  cuil: number; // Tu CUIT (emisor)

  @IsNumber()
  @IsPositive()
  pointOfSale: number; // Punto de venta

  @IsEnum(VoucherType)
  voucherType: VoucherType; // Código AFIP, ej 1=Factura A, 6=Factura B, etc

  @IsEnum(IvaCondition)
  ivaCondition: IvaCondition;

  @IsPositive()
  @IsNumber()
  voucherNumber: number; // Número secuencial del comprobante

  @IsString()
  emissionDate: string; // 'YYYYMMDD' string

  @IsOptional()
  @IsPositive()
  @IsNumber()
  contactCuil: number; // CUIT cliente receptor

  @IsPositive()
  @IsNumber()
  totalAmount: number; // Importe total factura

  @IsPositive()
  @IsNumber()
  netAmount: number; // Importe neto sin IVA

  @IsPositive()
  @IsOptional()
  @IsNumber()
  ivaAmount?: number; // IVA total

  @IsString()
  @IsOptional()
  currency?: string; // 'PES' normalmente

  @IsOptional()
  @IsNumber()
  associatedVoucherNumber?: number;

  @IsOptional()
  @IsEnum(VoucherType)
  associatedVoucherType?: VoucherType;
}
