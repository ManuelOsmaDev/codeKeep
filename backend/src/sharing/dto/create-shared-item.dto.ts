import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSharedItemDto {
  @IsEnum(['snippet', 'password'])
  @IsNotEmpty()
  itemType: 'snippet' | 'password';

  @IsUUID()
  @IsNotEmpty()
  itemId: string;
}
