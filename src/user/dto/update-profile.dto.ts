import { IsString, IsOptional, IsArray, ValidateNested, IsBoolean, IsDateString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

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

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences?: ExperienceDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
