import { IsNotEmpty, IsString, IsMongoId, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  postId: string;

  @IsMongoId()
  @IsOptional()
  parentId?: string;
}

