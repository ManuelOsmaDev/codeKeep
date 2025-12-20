import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { User } from '../users/entities/user.entity';
import { ListFilesDto } from './dto/list-files.dto';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { MoveFileDto } from './dto/move-file.dto';
import { CopyFileDto } from './dto/copy-file.dto';
import { ShareFileDto } from './dto/share-file.dto';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async getOAuth2Client(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || !user.googleAccessToken) {
      throw new UnauthorizedException('Google Drive not connected');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    return oauth2Client;
  }

  async listFiles(userId: string, filters: ListFilesDto) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    let query = 'trashed=false';
    
    if (filters.view === 'shared') {
      query += ` and sharedWithMe = true`;
    } else if (filters.view === 'starred') {
      query += ` and starred = true`;
    } else if (filters.view === 'trash') {
      query = `trashed = true`;
    } else if (filters.view === 'recent') {
      // Recent view doesn't need specific query filters, just ordering
      // and we don't filter by parent to show all recent files
    } else {
      // Default 'my-drive' behavior
      if (filters.folderId) {
        query += ` and '${filters.folderId}' in parents`;
      } else if (!filters.search) {
        query += ` and 'root' in parents`;
      }
    }
    
    if (filters.search) {
      query += ` and (name contains '${filters.search}' or fullText contains '${filters.search}')`;
    }

    const orderBy = filters.view === 'recent' ? 'recency desc' : (filters.orderBy || 'folder,modifiedTime desc');

    try {
      const response = await drive.files.list({
        pageSize: filters.pageSize || 20,
        pageToken: filters.pageToken,
        orderBy: orderBy,
        q: query,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink, owners, parents)',
      });

      return {
        files: response.data.files,
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      throw new BadRequestException('Failed to list files: ' + error.message);
    }
  }

  async getFile(userId: string, fileId: string) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    try {
      const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink, owners, parents, description',
      });

      return response.data;
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async downloadFile(userId: string, fileId: string) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    try {
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return response.data;
    } catch (error) {
      throw new NotFoundException('File not found or cannot be downloaded');
    }
  }

  async exportFile(userId: string, fileId: string, mimeType: string) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    try {
      const response = await drive.files.export(
        { fileId, mimeType },
        { responseType: 'text' }
      );

      return response.data;
    } catch (error) {
      throw new NotFoundException('File not found or cannot be exported');
    }
  }

  async createFile(userId: string, createFileDto: CreateFileDto) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: createFileDto.name,
      mimeType: createFileDto.mimeType,
      parents: createFileDto.parentId ? [createFileDto.parentId] : undefined,
    };

    const media = createFileDto.content !== undefined ? {
      mimeType: createFileDto.mimeType,
      body: Readable.from([createFileDto.content]),
    } : undefined;

    try {
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, webViewLink',
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to create file: ' + error.message);
    }
  }

  async updateFile(userId: string, fileId: string, updateFileDto: UpdateFileDto) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata: any = {};
    if (updateFileDto.name) {
      fileMetadata.name = updateFileDto.name;
    }
    if (updateFileDto.mimeType) {
      fileMetadata.mimeType = updateFileDto.mimeType;
    }

    const requestOptions: any = {
      fileId,
      requestBody: fileMetadata,
      fields: 'id, name, mimeType, webViewLink',
    };

    if (updateFileDto.content) {
      requestOptions.media = {
        mimeType: updateFileDto.mimeType || 'text/plain',
        body: Readable.from([updateFileDto.content]),
      };
    }

    try {
      const response = await drive.files.update(requestOptions);
      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to update file: ' + error.message);
    }
  }

  async deleteFile(userId: string, fileId: string) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    try {
      await drive.files.delete({ fileId });
      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new NotFoundException('File not found or cannot be deleted');
    }
  }

  async moveFile(userId: string, fileId: string, moveFileDto: MoveFileDto) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Get current parents
      const file = await drive.files.get({
        fileId,
        fields: 'parents',
      });

      const previousParents = file.data.parents?.join(',');

      // Move file
      const response = await drive.files.update({
        fileId,
        addParents: moveFileDto.newParentId,
        removeParents: previousParents,
        fields: 'id, name, parents',
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to move file: ' + error.message);
    }
  }

  async copyFile(userId: string, fileId: string, copyFileDto: CopyFileDto) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata: any = {};
    if (copyFileDto.newName) {
      fileMetadata.name = copyFileDto.newName;
    }
    if (copyFileDto.parentId) {
      fileMetadata.parents = [copyFileDto.parentId];
    }

    try {
      const response = await drive.files.copy({
        fileId,
        requestBody: fileMetadata,
        fields: 'id, name, mimeType, webViewLink',
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to copy file: ' + error.message);
    }
  }

  async createFolder(userId: string, folderName: string, parentId?: string) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    try {
      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, mimeType',
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to create folder: ' + error.message);
    }
  }

  async shareFile(userId: string, fileId: string, shareFileDto: ShareFileDto) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    const permission = {
      type: shareFileDto.type,
      role: shareFileDto.role,
      emailAddress: shareFileDto.type === 'user' ? shareFileDto.email : undefined,
    };

    try {
      const response = await drive.permissions.create({
        fileId,
        requestBody: permission,
        fields: 'id, type, role, emailAddress',
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to share file: ' + error.message);
    }
  }

  async searchFiles(userId: string, searchTerm: string) {
    const auth = await this.getOAuth2Client(userId);
    const drive = google.drive({ version: 'v3', auth });

    const query = `trashed=false and (name contains '${searchTerm}' or fullText contains '${searchTerm}')`;

    try {
      const response = await drive.files.list({
        pageSize: 50,
        q: query,
        orderBy: 'modifiedTime desc',
        fields: 'files(id, name, mimeType, modifiedTime, webViewLink, iconLink)',
      });

      return response.data.files;
    } catch (error) {
      throw new BadRequestException('Failed to search files: ' + error.message);
    }
  }
}
