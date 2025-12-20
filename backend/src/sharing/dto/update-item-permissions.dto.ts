import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemPermissionDto {
  @IsNotEmpty()
  userEmail: string;

  canView: boolean;

  canEdit: boolean;
}

export class UpdateItemPermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPermissionDto)
  permissions: ItemPermissionDto[];
}
