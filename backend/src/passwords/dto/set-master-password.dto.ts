import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SetMasterPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Master password must be at least 8 characters long' })
  masterPassword: string;
}
