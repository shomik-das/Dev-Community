import { IsNotEmpty, IsObject, IsNotEmptyObject } from 'class-validator';

export class CreateRecordDto {
  @IsObject()
  @IsNotEmptyObject()
  data: Record<string, any>;
}
