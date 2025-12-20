import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Get()
  async getBookmarks(@CurrentUser() user: User) {
    return this.bookmarksService.getBookmarks(user.id);
  }

  @Post(':snippetId')
  async addBookmark(@CurrentUser() user: User, @Param('snippetId') snippetId: string) {
    return this.bookmarksService.addBookmark(user.id, snippetId);
  }

  @Delete(':snippetId')
  async removeBookmark(@CurrentUser() user: User, @Param('snippetId') snippetId: string) {
    return this.bookmarksService.removeBookmark(user.id, snippetId);
  }
}
