import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { User } from '../users/entities/user.entity';
import { Snippet } from '../snippets/entities/snippet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Snippet])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
