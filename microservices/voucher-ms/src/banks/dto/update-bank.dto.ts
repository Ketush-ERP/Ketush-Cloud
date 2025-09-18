import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateBankDto } from './create-back.dto';

export class UpdateBankDto extends PartialType(CreateBankDto) {
  @IsString()
  @IsOptional()
  id: string;
}
