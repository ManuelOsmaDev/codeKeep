import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class ShareFileDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsIn(['reader', 'writer', 'commenter', 'owner'])
  role: 'reader' | 'writer' | 'commenter' | 'owner';

  @IsString()
  @IsIn(['user', 'group', 'domain', 'anyone'])
  type: 'user' | 'group' | 'domain' | 'anyone';
}
