import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Snippet } from '../snippets/entities/snippet.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Snippet)
    private snippetRepository: Repository<Snippet>,
  ) {}

  async getFavorites(userId: string): Promise<Snippet[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.favorites || [];
  }

  async addFavorite(userId: string, snippetId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const snippet = await this.snippetRepository.findOne({
      where: { id: snippetId },
    });

    if (!snippet) {
      throw new NotFoundException('Snippet not found');
    }

    // Check if already in favorites
    const alreadyFavorited = user.favorites?.some(fav => fav.id === snippetId);
    if (alreadyFavorited) {
      return { message: 'Snippet already in favorites' };
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    user.favorites.push(snippet);
    await this.userRepository.save(user);

    return { message: 'Added to favorites' };
  }

  async removeFavorite(userId: string, snippetId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.favorites = user.favorites?.filter(fav => fav.id !== snippetId) || [];
    await this.userRepository.save(user);

    return { message: 'Removed from favorites' };
  }
}
