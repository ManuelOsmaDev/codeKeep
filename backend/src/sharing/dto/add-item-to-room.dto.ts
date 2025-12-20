import { IsString, IsNotEmpty, IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemPermissionDto {
  @IsString()
  @IsNotEmpty()
  userEmail: string;

  @IsBoolean()
  canView: boolean;

  @IsBoolean()
  canEdit: boolean;
}

export class AddItemToRoomDto {
  @IsString()
  @IsNotEmpty()
  itemType: string; // 'snippet' or 'password'

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPermissionDto)
  permissions?: ItemPermissionDto[];
}
