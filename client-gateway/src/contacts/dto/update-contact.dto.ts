import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';
import { IsPositive, IsString } from 'class-validator';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  id: string;
}

export class ChangeProfitMarginDto {
  @IsPositive()
  profitMargin: number;
}
