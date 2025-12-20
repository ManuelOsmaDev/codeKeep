import { IsNotEmpty, IsOptional, IsString, MaxLength, IsBoolean, IsArray, IsEmail } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  allowedEmails?: string[];
}
