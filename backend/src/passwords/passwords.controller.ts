import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PasswordsService } from './passwords.service';
import { CreatePasswordDto } from './dto/create-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SetMasterPasswordDto } from './dto/set-master-password.dto';
import { VerifyMasterPasswordDto } from './dto/verify-master-password.dto';
import { DecryptPasswordDto } from './dto/decrypt-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('passwords')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  @Post('master-password')
  async setMasterPassword(
    @CurrentUser() user: User,
    @Body() setMasterPasswordDto: SetMasterPasswordDto,
  ) {
    return this.passwordsService.setMasterPassword(
      user.id,
      setMasterPasswordDto.masterPassword,
    );
  }

  @Post('verify-master')
  async verifyMasterPassword(
    @CurrentUser() user: User,
    @Body() verifyMasterPasswordDto: VerifyMasterPasswordDto,
  ) {
    return this.passwordsService.verifyMasterPassword(
      user.id,
      verifyMasterPasswordDto.masterPassword,
    );
  }

  @Post('unlock')
  async unlockAndList(
    @CurrentUser() user: User,
    @Body() verifyMasterPasswordDto: VerifyMasterPasswordDto,
  ) {
    return this.passwordsService.unlockAndList(
      user.id,
      verifyMasterPasswordDto.masterPassword,
    );
  }

  @Post('migrate-titles')
  async migrateTitles(
    @CurrentUser() user: User,
    @Body() verifyMasterPasswordDto: VerifyMasterPasswordDto,
  ) {
    return this.passwordsService.migrateTitles(
      user.id,
      verifyMasterPasswordDto.masterPassword,
    );
  }

  @Get('has-master')
  async hasMasterPassword(@CurrentUser() user: User) {
    const hasMaster = await this.passwordsService.hasMasterPassword(user.id);
    return { hasMasterPassword: hasMaster };
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createPasswordDto: CreatePasswordDto,
  ) {
    return this.passwordsService.create(user.id, createPasswordDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.passwordsService.findAll(user.id);
  }

  @Post(':id/decrypt')
  async decryptPassword(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() decryptPasswordDto: DecryptPasswordDto,
  ) {
    return this.passwordsService.decryptPassword(
      user.id,
      id,
      decryptPasswordDto.masterPassword,
    );
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.passwordsService.update(user.id, id, updatePasswordDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.passwordsService.remove(user.id, id);
  }
}
