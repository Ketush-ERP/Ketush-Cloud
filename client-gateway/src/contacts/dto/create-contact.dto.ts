import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ContactType, DocumentType, IvaCondition } from '../enum';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsEnum(IvaCondition)
  ivaCondition: IvaCondition;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  nameFile: string;

  @IsEnum(ContactType)
  type: ContactType;

  @IsOptional()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    {
      message: 'profitMargin debe ser un número válido',
    },
  )
  profitMargin?: number;
}
