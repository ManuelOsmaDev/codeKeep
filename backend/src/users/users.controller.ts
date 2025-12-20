import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      notifications: user.notifications,
      compactMode: user.compactMode,
      defaultLanguage: user.defaultLanguage,
      lineNumbers: user.lineNumbers,
      autoSave: user.autoSave,
      emailNotifications: user.emailNotifications,
      isAdmin: user.isAdmin,
      canManagePasswords: user.canManagePasswords,
      canManageSnippets: user.canManageSnippets,
    };
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      theme: updatedUser.theme,
      notifications: updatedUser.notifications,
      compactMode: updatedUser.compactMode,
      defaultLanguage: updatedUser.defaultLanguage,
      lineNumbers: updatedUser.lineNumbers,
      autoSave: updatedUser.autoSave,
      emailNotifications: updatedUser.emailNotifications,
    };
  }

  @Get('stats')
  async getStats(@CurrentUser() user: User) {
    return this.usersService.getStats(user.id);
  }

  @Patch(':id/permissions')
  @RequirePermissions('isAdmin')
  async updatePermissions(
    @Param('id') id: string,
    @Body() permissions: { isAdmin?: boolean; canManagePasswords?: boolean; canManageSnippets?: boolean },
  ) {
    return this.usersService.updatePermissions(id, permissions);
  }
  @Get()
  @RequirePermissions('isAdmin')
  async getAll() {
    return this.usersService.findAll();
  }
}
