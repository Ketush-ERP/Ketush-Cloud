import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsNumber()
  @IsOptional()
  commissionPercentage: number;

  @IsBoolean()
  @IsOptional()
  available: boolean;
}
