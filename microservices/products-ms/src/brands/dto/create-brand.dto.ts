import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  public available: boolean;
}
