import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { GoogleDriveService } from './google-drive.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ListFilesDto } from './dto/list-files.dto';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { MoveFileDto } from './dto/move-file.dto';
import { CopyFileDto } from './dto/copy-file.dto';
import { ShareFileDto } from './dto/share-file.dto';

@Controller('google-drive')
@UseGuards(JwtAuthGuard)
export class GoogleDriveController {
  constructor(private googleDriveService: GoogleDriveService) {}

  @Get('files')
  async listFiles(@CurrentUser() user: User, @Query() filters: ListFilesDto) {
    return this.googleDriveService.listFiles(user.id, filters);
  }

  @Get('files/:fileId')
  async getFile(@CurrentUser() user: User, @Param('fileId') fileId: string) {
    return this.googleDriveService.getFile(user.id, fileId);
  }

  @Get('files/:fileId/download')
  async downloadFile(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const stream = await this.googleDriveService.downloadFile(user.id, fileId);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment',
    });
    return new StreamableFile(stream);
  }

  @Get('files/:fileId/export')
  async exportFile(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
    @Query('mimeType') mimeType: string,
  ) {
    return this.googleDriveService.exportFile(user.id, fileId, mimeType);
  }

  @Get('search')
  async searchFiles(
    @CurrentUser() user: User,
    @Query('q') searchTerm: string,
  ) {
    return this.googleDriveService.searchFiles(user.id, searchTerm);
  }

  @Post('files')
  async createFile(
    @CurrentUser() user: User,
    @Body() createFileDto: CreateFileDto,
  ) {
    return this.googleDriveService.createFile(user.id, createFileDto);
  }

  @Patch('files/:fileId')
  async updateFile(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.googleDriveService.updateFile(user.id, fileId, updateFileDto);
  }

  @Delete('files/:fileId')
  async deleteFile(@CurrentUser() user: User, @Param('fileId') fileId: string) {
    return this.googleDriveService.deleteFile(user.id, fileId);
  }

  @Patch('files/:fileId/move')
  async moveFile(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
    @Body() moveFileDto: MoveFileDto,
  ) {
    return this.googleDriveService.moveFile(user.id, fileId, moveFileDto);
  }

  @Post('files/:fileId/copy')
  async copyFile(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
    @Body() copyFileDto: CopyFileDto,
  ) {
    return this.googleDriveService.copyFile(user.id, fileId, copyFileDto);
  }

  @Post('folders')
  async createFolder(
    @CurrentUser() user: User,
    @Body() body: { name: string; parentId?: string },
  ) {
    return this.googleDriveService.createFolder(
      user.id,
      body.name,
      body.parentId,
    );
  }

  @Post('files/:fileId/share')
  async shareFile(
    @CurrentUser() user: User,
    @Param('fileId') fileId: string,
    @Body() shareFileDto: ShareFileDto,
  ) {
    return this.googleDriveService.shareFile(user.id, fileId, shareFileDto);
  }
}
