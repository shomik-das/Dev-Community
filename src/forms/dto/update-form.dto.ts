import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional, IsArray, ValidateNested, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFormFieldDto } from './create-form.dto';

export class UpdateFormFieldDto extends PartialType(CreateFormFieldDto) {
  @IsUUID()
  @IsOptional()
  id?: string;
}

export class UpdateFormDto {
  @IsString()
  @IsOptional()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFormFieldDto)
  fields?: UpdateFormFieldDto[];
}


