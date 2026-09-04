import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum UserRole {
  STUDENT = 'STUDENT',
  TRAINER = 'TRAINER',
}

export class RegisterDto {
  @IsString()
  @Length(3, 255)
  full_name: string;

  @IsString()
  @Length(3, 100)
  username: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsString()
  @Length(8, 100)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
