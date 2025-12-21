import { IsEmail, IsOptional, IsIn, IsUUID } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['owner', 'admin', 'member'])
  role?: 'owner' | 'admin' | 'member';

  @IsIn(['application', 'version', 'project'])
  resourceType: 'application' | 'version' | 'project';

  @IsUUID()
  resourceId: string;
}

export class UpdateMemberRoleDto {
  @IsIn(['admin', 'member'])
  role: 'admin' | 'member';
}

export class RemoveMemberDto {
  @IsUUID()
  userId: string;
}
