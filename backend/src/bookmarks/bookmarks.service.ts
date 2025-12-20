import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Snippet } from '../snippets/entities/snippet.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Snippet)
    private snippetRepository: Repository<Snippet>,
  ) {}

  async getBookmarks(userId: string): Promise<Snippet[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.bookmarks || [];
  }

  async addBookmark(userId: string, snippetId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
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

    // Check if already bookmarked
    const alreadyBookmarked = user.bookmarks?.some(bm => bm.id === snippetId);
    if (alreadyBookmarked) {
      return { message: 'Snippet already bookmarked' };
    }

    if (!user.bookmarks) {
      user.bookmarks = [];
    }

    user.bookmarks.push(snippet);
    await this.userRepository.save(user);

    return { message: 'Added to bookmarks' };
  }

  async removeBookmark(userId: string, snippetId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.bookmarks = user.bookmarks?.filter(bm => bm.id !== snippetId) || [];
    await this.userRepository.save(user);

    return { message: 'Removed from bookmarks' };
  }
}
