import { IsString, IsOptional } from 'class-validator';

export class CopyFileDto {
  @IsOptional()
  @IsString()
  newName?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
