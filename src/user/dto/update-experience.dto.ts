import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ExperienceDto {
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

export class UpdateExperienceDto extends PartialType(ExperienceDto) {}

