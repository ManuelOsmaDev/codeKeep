import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { User } from '../users/entities/user.entity';
import { Snippet } from '../snippets/entities/snippet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Snippet])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
