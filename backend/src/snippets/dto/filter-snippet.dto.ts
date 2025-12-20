import { IsOptional, IsString } from 'class-validator';

export class FilterSnippetDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tags?: string; // comma-separated tags
}
