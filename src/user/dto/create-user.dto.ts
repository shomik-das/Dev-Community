import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from 'src/auth/enums/role.enum';

class ExperienceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsDateString()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  current?: boolean;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) //todo read this
  @Type(() => ExperienceDto)
  experiences?: ExperienceDto[];
}
