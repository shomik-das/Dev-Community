import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSnippetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50000)
  content: string;
}



