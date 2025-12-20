import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreatePasswordDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  masterPassword: string; // Necesario para cifrar
}
