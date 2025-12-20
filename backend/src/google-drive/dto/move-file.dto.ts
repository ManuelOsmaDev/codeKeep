import { IsString, IsNotEmpty } from 'class-validator';

export class MoveFileDto {
  @IsString()
  @IsNotEmpty()
  newParentId: string;
}
