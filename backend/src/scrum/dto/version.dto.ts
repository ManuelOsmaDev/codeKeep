import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsUUID()
  applicationId: string;
}

export class UpdateVersionDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
