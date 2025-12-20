import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTaskStateDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsNumber()
  orden?: number;

  @IsOptional()
  @IsString()
  color?: string;
}
