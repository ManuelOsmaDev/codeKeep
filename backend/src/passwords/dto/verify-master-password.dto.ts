import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyMasterPasswordDto {
  @IsString()
  @IsNotEmpty()
  masterPassword: string;
}
