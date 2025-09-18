import { PartialType } from '@nestjs/mapped-types';
import { CreateBankDto } from './create-back.dto';

export class UpdateBankDto extends PartialType(CreateBankDto) {}
