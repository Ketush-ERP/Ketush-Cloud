import { IsArray, IsNumber, IsString } from 'class-validator';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

export class UploadWhitFileDto {
  @IsArray()
  public rows: CreateProductDto[];

  @IsString()
  public id: string;
}

export class ChangeProfitMarginOfProductDto {
  @IsString()
  public supplierId: string;
  @IsNumber()
  public profitMargin: number;
}

export class ChangeCommissionPercentageOfProductDto {
  @IsString()
  public cardId: string;

  @IsNumber()
  public commissionPercentage: number;
}
