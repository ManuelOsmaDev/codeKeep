import { IsString, MinLength, IsArray, ArrayMinSize } from 'class-validator';

export class CreateSnippetDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  language: string;

  @IsArray()
  tags: string[];
}
