import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateSprintBacklogDto {
  @IsString()
  nombre: string;

  @IsUUID()
  projectId: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsUUID()
  stateId: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  activityIds?: string[];
}

export class UpdateSprintBacklogDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsUUID()
  stateId?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  activityIds?: string[];
}

export class AssignActivityToSprintDto {
  @IsUUID()
  activityId: string;

  @IsUUID()
  sprintBacklogId: string;
}
