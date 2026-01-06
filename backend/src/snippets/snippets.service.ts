import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Snippet } from './entities/snippet.entity';
import { SharedItem } from '../sharing/entities/shared-item.entity';
import { RoomAccessList } from '../sharing/entities/room-access-list.entity';
import { User } from '../users/entities/user.entity';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { FilterSnippetDto } from './dto/filter-snippet.dto';

@Injectable()
export class SnippetsService {
  constructor(
    @InjectRepository(Snippet)
    @InjectRepository(Snippet)
    private snippetRepository: Repository<Snippet>,
    @InjectRepository(SharedItem) // Injected
    private sharedItemRepository: Repository<SharedItem>,
    @InjectRepository(RoomAccessList) // Injected
    private accessListRepository: Repository<RoomAccessList>,
    @InjectRepository(User) // Injected
    private userRepository: Repository<User>,
  ) { }

  async create(userId: string, createSnippetDto: CreateSnippetDto): Promise<Snippet> {
    const snippet = this.snippetRepository.create({
      ...createSnippetDto,
      userId,
    });
    return this.snippetRepository.save(snippet);
  }

  async findAll(userId: string, filters: FilterSnippetDto): Promise<Snippet[]> {
    const queryBuilder = this.snippetRepository.createQueryBuilder('snippet');

    queryBuilder.where('snippet.userId = :userId', { userId });

    if (filters.language && filters.language !== 'all') {
      queryBuilder.andWhere('snippet.language = :language', { language: filters.language });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(snippet.title ILIKE :search OR snippet.code ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.tags) {
      const tagsArray = filters.tags.split(',').map(tag => tag.trim());
      // PostgreSQL array contains operator
      for (const tag of tagsArray) {
        queryBuilder.andWhere(':tag = ANY(snippet.tags)', { tag });
      }
    }

    queryBuilder.orderBy('snippet.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Snippet> {
    const snippet = await this.snippetRepository.findOne({ where: { id, userId } });
    if (!snippet) {
      throw new NotFoundException('Snippet not found');
    }
    return snippet;
  }

  async update(id: string, userId: string, updateSnippetDto: UpdateSnippetDto): Promise<Snippet> {
    let snippet = await this.snippetRepository.findOne({ where: { id } });
    if (!snippet) {
      throw new NotFoundException('Snippet not found');
    }

    if (snippet.userId !== userId) {
      // Check if shared via room with write permission
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new ForbiddenException('User not found');

      // Find rooms where this snippet is shared
      const sharedItems = await this.sharedItemRepository.find({
        where: { itemId: id, itemType: 'snippet' },
        relations: ['room'],
      });

      let hasPermission = false;
      for (const item of sharedItems) {
        // Check if user is the owner of the room
        if (item.room && item.room.ownerId === userId) {
          hasPermission = true;
          break;
        }

        const accessEntry = await this.accessListRepository.findOne({
          where: { roomId: item.roomId, userEmail: user.email },
        });
        if (accessEntry && accessEntry.canUpdate) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission to update this snippet');
      }
    }

    Object.assign(snippet, updateSnippetDto);
    return this.snippetRepository.save(snippet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const snippet = await this.findOne(id, userId);
    await this.snippetRepository.remove(snippet);
  }

  async getAllTags(userId: string): Promise<string[]> {
    const snippets = await this.snippetRepository.find({
      where: { userId },
      select: ['tags'],
    });

    const allTags = snippets.flatMap(snippet => snippet.tags);
    return [...new Set(allTags)];
  }
}
