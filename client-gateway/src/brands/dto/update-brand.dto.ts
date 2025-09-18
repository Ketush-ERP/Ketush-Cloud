import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  public available: boolean;
}
