import { IsNotEmpty, IsString, Length, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, IsEnum, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../entities/form-field.entity';

export class CreateFormFieldDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  label: string;

  @IsEnum(FieldType)
  @IsNotEmpty()
  field_type: FieldType;

  @IsBoolean()
  @IsOptional()
  is_required?: boolean;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsInt()
  @IsOptional()
  position?: number;
}

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  fields: CreateFormFieldDto[];
}
