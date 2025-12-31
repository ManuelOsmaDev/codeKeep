import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { FilterSnippetDto } from './dto/filter-snippet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('snippets')
@UseGuards(JwtAuthGuard)
export class SnippetsController {
  constructor(private snippetsService: SnippetsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() createSnippetDto: CreateSnippetDto) {
    return this.snippetsService.create(user.id, createSnippetDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User, @Query() filters: FilterSnippetDto) {
    return this.snippetsService.findAll(user.id, filters);
  }

  @Get('tags')
  async getAllTags(@CurrentUser() user: User) {
    return this.snippetsService.getAllTags(user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.snippetsService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateSnippetDto: UpdateSnippetDto,
  ) {
    return this.snippetsService.update(id, user.id, updateSnippetDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.snippetsService.remove(id, user.id);
    return { message: 'Snippet deleted successfully' };
  }
}
