import { PartialType } from '@nestjs/mapped-types';
import { CreateVoucherDto } from './create-voucher.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {
  @IsString()
  @IsOptional()
  id!: string;
}
