import { IsString, IsOptional, IsUUID, IsIn, IsDateString, IsNumber } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descriptor?: string;

  @IsUUID()
  projectId: string;

  @IsUUID()
  stateId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descriptor?: string;

  @IsOptional()
  @IsUUID()
  stateId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

export class MoveActivityDto {
  @IsUUID()
  stateId: string;

  @IsNumber()
  orden: number;
}
