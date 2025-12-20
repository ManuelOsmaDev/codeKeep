import { IsString, IsNotEmpty } from 'class-validator';

export class DecryptPasswordDto {
  @IsString()
  @IsNotEmpty()
  masterPassword: string;
}
