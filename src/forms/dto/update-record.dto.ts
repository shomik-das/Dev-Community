import { IsNotEmpty, IsObject, IsNotEmptyObject } from 'class-validator';

export class UpdateRecordDto {
  @IsObject()
  @IsNotEmptyObject()
  data: Record<string, any>;
}
