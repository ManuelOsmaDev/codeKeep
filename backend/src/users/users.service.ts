import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async getStats(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['snippets', 'favorites', 'bookmarks'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      snippetsCount: user.snippets?.length || 0,
      favoritesCount: user.favorites?.length || 0,
      bookmarksCount: user.bookmarks?.length || 0,
    };
  }

  async updatePermissions(
    id: string,
    permissions: { isAdmin?: boolean; canManagePasswords?: boolean; canManageSnippets?: boolean },
  ) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (permissions.isAdmin !== undefined) user.isAdmin = permissions.isAdmin;
    if (permissions.canManagePasswords !== undefined) user.canManagePasswords = permissions.canManagePasswords;
    if (permissions.canManageSnippets !== undefined) user.canManageSnippets = permissions.canManageSnippets;

    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'avatar', 'isAdmin', 'canManagePasswords', 'canManageSnippets'],
    });
  }
}
