import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  comment: string;

  @IsUUID()
  @IsOptional()
  activityId?: string;

  @IsUUID()
  @IsOptional()
  sprintId?: string;
}
