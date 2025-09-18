import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsEnum,
} from 'class-validator';

export enum Role {
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export class RegisterUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  cuil: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either SELLER or ADMIN' })
  role?: Role;
}
