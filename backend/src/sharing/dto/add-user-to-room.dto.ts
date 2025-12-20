import { IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class AddUserToRoomDto {
  @IsEmail()
  userEmail: string;

  @IsOptional()
  @IsBoolean()
  canCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  canUpdate?: boolean;

  @IsOptional()
  @IsBoolean()
  canDelete?: boolean;

  @IsOptional()
  @IsBoolean()
  canShare?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewPasswords?: boolean;
}
