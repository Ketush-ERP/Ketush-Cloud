import { ContactType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(ContactType)
  type: ContactType;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  offset: number;

  constructor(partial: Partial<PaginationDto> = {}) {
    Object.assign(this, partial);
    this.limit = partial?.limit || 10;
    this.offset = partial?.offset || 1;
  }
}
