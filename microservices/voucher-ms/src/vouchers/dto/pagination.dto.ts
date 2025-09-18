import { ConditionPayment } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator';
import { VoucherType } from 'src/enum';

export class PaginationDto {
  @IsEnum(ConditionPayment)
  @IsOptional()
  conditionPayment: ConditionPayment;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  offset: number;

  @IsOptional()
  @IsString()
  query?: string;

  @IsEnum(VoucherType)
  @IsOptional()
  type?: VoucherType;

  constructor(partial: Partial<PaginationDto> = {}) {
    Object.assign(this, partial);
    this.limit = partial?.limit || 10;
    this.offset = partial?.offset || 1;
  }
}
