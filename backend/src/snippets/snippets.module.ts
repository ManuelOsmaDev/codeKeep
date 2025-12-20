import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnippetsService } from './snippets.service';
import { SnippetsController } from './snippets.controller';
import { Snippet } from './entities/snippet.entity';
import { SharedItem } from '../sharing/entities/shared-item.entity';
import { RoomAccessList } from '../sharing/entities/room-access-list.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Snippet, SharedItem, RoomAccessList, User])],
  controllers: [SnippetsController],
  providers: [SnippetsService],
  exports: [SnippetsService],
})
export class SnippetsModule {}
