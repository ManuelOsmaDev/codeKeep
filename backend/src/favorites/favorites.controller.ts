import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@CurrentUser() user: User) {
    return this.favoritesService.getFavorites(user.id);
  }

  @Post(':snippetId')
  async addFavorite(@CurrentUser() user: User, @Param('snippetId') snippetId: string) {
    return this.favoritesService.addFavorite(user.id, snippetId);
  }

  @Delete(':snippetId')
  async removeFavorite(@CurrentUser() user: User, @Param('snippetId') snippetId: string) {
    return this.favoritesService.removeFavorite(user.id, snippetId);
  }
}
