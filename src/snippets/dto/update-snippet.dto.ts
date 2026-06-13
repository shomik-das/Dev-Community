import { PartialType } from '@nestjs/mapped-types';
import { CreateSnippetDto } from './create-snippet.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SnippetStatus } from '../entities/snippet.entity';

export class UpdateSnippetDto extends PartialType(CreateSnippetDto) {
  @IsEnum(SnippetStatus)
  @IsOptional()
  status?: SnippetStatus;
}


