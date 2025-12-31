import { Injectable, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedRoom } from './entities/shared-room.entity';
import { SharedItem } from './entities/shared-item.entity';
import { RoomAccessList } from './entities/room-access-list.entity';
import { SharedItemPermission } from './entities/shared-item-permission.entity';
import { Snippet } from '../snippets/entities/snippet.entity';
import { Password } from '../passwords/entities/password.entity';
import { User } from '../users/entities/user.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddItemToRoomDto } from './dto/add-item-to-room.dto';
import { UpdateItemPermissionsDto } from './dto/update-item-permissions.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { nanoid } from 'nanoid';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(SharedRoom)
    private roomRepository: Repository<SharedRoom>,
    @InjectRepository(SharedItem)
    private sharedItemRepository: Repository<SharedItem>,
    @InjectRepository(RoomAccessList)
    private accessListRepository: Repository<RoomAccessList>,
    @InjectRepository(SharedItemPermission)
    private itemPermissionRepository: Repository<SharedItemPermission>,
    @InjectRepository(Snippet)
    private snippetRepository: Repository<Snippet>,
    @InjectRepository(Password)
    private passwordRepository: Repository<Password>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private encryptionService: EncryptionService,
  ) {}

  async createRoom(ownerId: string, createRoomDto: CreateRoomDto) {
    const { name, description, isPublic = true, allowedEmails = [] } = createRoomDto;
    const shareToken = nanoid(10);

    const room = this.roomRepository.create({
      name,
      description,
      ownerId,
      shareToken,
      isActive: true,
      isPublic,
      viewCount: 0,
    });

    const saved = await this.roomRepository.save(room);

    if (!isPublic && allowedEmails.length > 0) {
      for (const email of allowedEmails) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
          const accessEntry = this.accessListRepository.create({
            roomId: saved.id,
            userEmail: email,
          });
          await this.accessListRepository.save(accessEntry);
        }
      }
    }

    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      shareToken: saved.shareToken,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/room/${saved.shareToken}`,
      viewCount: saved.viewCount,
      isPublic: saved.isPublic,
      itemCount: 0,
      createdAt: saved.createdAt,
    };
  }

  async getMyRooms(userId: string) {
    const rooms = await this.roomRepository.find({
      where: { ownerId: userId, isActive: true },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      shareToken: room.shareToken,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/room/${room.shareToken}`,
      viewCount: room.viewCount,
      itemCount: room.items?.length || 0,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      isPublic: room.isPublic,
    }));
  }

  async getRoomByToken(token: string, userEmail?: string) {
    const room = await this.roomRepository.findOne({
      where: { shareToken: token, isActive: true },
      relations: ['items', 'owner'],
    });

    if (!room) {
      throw new NotFoundException('Room not found or inactive');
    }

    let permissions = {
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canShare: false,
      canViewPasswords: false,
      isOwner: false,
    };

    if (userEmail) {
      if (room.owner.email.toLowerCase() === userEmail.toLowerCase()) {
        permissions = {
          canCreate: true,
          canUpdate: true,
          canDelete: true,
          canShare: true,
          canViewPasswords: true,
          isOwner: true,
        };
      } else {
        const accessEntry = await this.accessListRepository.findOne({
          where: { roomId: room.id, userEmail },
        });

        if (accessEntry) {
          permissions = {
            canCreate: accessEntry.canCreate,
            canUpdate: accessEntry.canUpdate,
            canDelete: accessEntry.canDelete,
            canShare: accessEntry.canShare,
            canViewPasswords: accessEntry.canViewPasswords,
            isOwner: false,
          };
        }
      }
    }

    if (!room.isPublic) {
      if (!userEmail) {
        throw new ForbiddenException('This room is private. Please log in to access it.');
      }

      if (!permissions.isOwner && !permissions.canCreate && !permissions.canUpdate && !permissions.canDelete && !permissions.canShare && !permissions.canViewPasswords) {
        const hasAccess = await this.checkAccess(room.id, userEmail);
        if (!hasAccess) {
          throw new ForbiddenException('You do not have access to this room');
        }
      }
    }

    await this.roomRepository.increment({ id: room.id }, 'viewCount', 1);

    const itemsWithData = await Promise.all(
      room.items.map(async (item) => {
        let itemData = null;
        if (item.itemType === 'snippet') {
          itemData = await this.snippetRepository.findOne({
            where: { id: item.itemId },
          });
        } else if (item.itemType === 'password') {
          const passwordEntity = await this.passwordRepository.findOne({
            where: { id: item.itemId },
          });
          if (passwordEntity) {
            // Transform password data for room sharing
            // Use the sharedPassword from the SharedItem if available
            itemData = {
              id: passwordEntity.id,
              name: passwordEntity.title, // Frontend expects 'name', entity has 'title'
              username: passwordEntity.username,
              url: passwordEntity.url,
              password: item.sharedPassword || '[Protected - Contact owner for access]',
              createdAt: passwordEntity.createdAt,
              updatedAt: passwordEntity.updatedAt,
            };
          }
        }

        return {
          id: item.id,
          itemType: item.itemType,
          itemData,
          addedAt: item.addedAt,
        };
      }),
    );

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      isPublic: room.isPublic,
      owner: {
        name: room.owner.name,
        avatar: room.owner.avatar,
      },
      items: itemsWithData.filter((item) => item.itemData !== null),
      viewCount: room.viewCount + 1,
      createdAt: room.createdAt,
      currentUserPermissions: permissions,
    };
  }

  async addItemToRoom(userId: string, roomId: string, addItemDto: AddItemToRoomDto) {
    const { itemType, itemId } = addItemDto;

    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.ownerId !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new ForbiddenException('User not found');

      const accessEntry = await this.accessListRepository.findOne({
        where: { roomId, userEmail: user.email },
      });

      if (!accessEntry || !accessEntry.canCreate) {
        throw new ForbiddenException('You do not have permission to add items to this room');
      }
    }

    if (itemType === 'snippet') {
      const snippet = await this.snippetRepository.findOne({
        where: { id: itemId, userId },
      });
      if (!snippet) {
        throw new NotFoundException('Snippet not found or you do not own it');
      }
    } else if (itemType === 'password') {
      const password = await this.passwordRepository.findOne({
        where: { id: itemId, userId },
      });
      if (!password) {
        throw new NotFoundException('Password not found or you do not own it');
      }

      // For passwords, we need to decrypt and store the actual password
      if (!addItemDto.masterPassword) {
        throw new BadRequestException('Master password is required to share passwords');
      }

      // Verify master password and decrypt
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.masterPasswordHash) {
        throw new BadRequestException('Master password not set');
      }

      const isValid = await this.encryptionService.verifyMasterPassword(
        addItemDto.masterPassword,
        user.masterPasswordHash,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid master password');
      }

      // Decrypt the password
      try {
        const [encryptedData, authTag] = password.encryptedData.split(':');
        const decryptedData = this.encryptionService.decrypt(
          encryptedData,
          password.iv,
          authTag,
          addItemDto.masterPassword,
          password.salt,
        );

        // Check for existing before creating
        const existing = await this.sharedItemRepository.findOne({
          where: { roomId, itemType: itemType as 'snippet' | 'password', itemId },
        });

        if (existing) {
          throw new BadRequestException('Item already added to this room');
        }

        // Create shared item with decrypted password
        const sharedItem = this.sharedItemRepository.create({
          roomId,
          itemType: itemType as 'snippet' | 'password',
          itemId,
          sharedPassword: decryptedData.password, // Store the actual password
        });

        await this.sharedItemRepository.save(sharedItem);

        if (addItemDto.permissions && addItemDto.permissions.length > 0) {
          for (const perm of addItemDto.permissions) {
            const itemPermission = this.itemPermissionRepository.create({
              sharedItemId: sharedItem.id,
              userEmail: perm.userEmail,
              canView: perm.canView,
              canEdit: perm.canEdit,
            });
            await this.itemPermissionRepository.save(itemPermission);
          }
        }

        return { success: true, itemId: sharedItem.id };
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException('Failed to decrypt password');
      }
    }

    const existing = await this.sharedItemRepository.findOne({
      where: { roomId, itemType: itemType as 'snippet' | 'password', itemId },
    });

    if (existing) {
      throw new BadRequestException('Item already added to this room');
    }

    const sharedItem = this.sharedItemRepository.create({
      roomId,
      itemType: itemType as 'snippet' | 'password',
      itemId,
    });

    await this.sharedItemRepository.save(sharedItem);

    if (addItemDto.permissions && addItemDto.permissions.length > 0) {
      for (const perm of addItemDto.permissions) {
        const itemPermission = this.itemPermissionRepository.create({
          sharedItemId: sharedItem.id,
          userEmail: perm.userEmail,
          canView: perm.canView,
          canEdit: perm.canEdit,
        });
        await this.itemPermissionRepository.save(itemPermission);
      }
    }

    return { success: true, itemId: sharedItem.id };
  }

  async removeItemFromRoom(userId: string, roomId: string, sharedItemId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.ownerId !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new ForbiddenException('User not found');

      const accessEntry = await this.accessListRepository.findOne({
        where: { roomId, userEmail: user.email },
      });

      if (!accessEntry || !accessEntry.canDelete) {
        throw new ForbiddenException('You do not have permission to delete items from this room');
      }
    }

    const sharedItem = await this.sharedItemRepository.findOne({
      where: { id: sharedItemId, roomId },
    });

    if (!sharedItem) {
      throw new NotFoundException('Item not found in this room');
    }

    await this.sharedItemRepository.remove(sharedItem);

    return { message: 'Item removed from room successfully' };
  }

  async deleteRoom(userId: string, roomId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own rooms');
    }

    room.isActive = false;
    await this.roomRepository.save(room);

    return { message: 'Room deleted successfully' };
  }

  async getRoomItems(userId: string, roomId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['items'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.ownerId !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new ForbiddenException('User not found');

      const accessEntry = await this.accessListRepository.findOne({
        where: { roomId, userEmail: user.email },
      });

      if (!room.isPublic && !accessEntry) {
        throw new ForbiddenException('You do not have access to this room');
      }
    }

    const itemsWithData = await Promise.all(
      room.items.map(async (item) => {
        let itemData = null;

        if (room.ownerId !== userId) {
          const user = await this.userRepository.findOne({ where: { id: userId } });
          const accessEntry = await this.accessListRepository.findOne({
            where: { roomId, userEmail: user.email },
          });

          if (item.itemType === 'password') {
            if (!accessEntry || !accessEntry.canViewPasswords) {
              return null;
            }
          }
        }

        if (item.itemType === 'snippet') {
          itemData = await this.snippetRepository.findOne({
            where: { id: item.itemId },
          });
        } else if (item.itemType === 'password') {
          const passwordEntity = await this.passwordRepository.findOne({
            where: { id: item.itemId },
          });
          if (passwordEntity) {
            // Transform password data for room sharing
            itemData = {
              id: passwordEntity.id,
              name: passwordEntity.title,
              username: passwordEntity.username,
              url: passwordEntity.url,
              password: item.sharedPassword || '[Protected - Contact owner for access]',
              createdAt: passwordEntity.createdAt,
              updatedAt: passwordEntity.updatedAt,
            };
          }
        }

        return {
          id: item.id,
          itemType: item.itemType,
          itemId: item.itemId,
          itemData,
          addedAt: item.addedAt,
        };
      }),
    );

    return itemsWithData.filter((item) => item !== null && item.itemData !== null);
  }

  async getSharedWithMe(userEmail: string) {
    const accessEntries = await this.accessListRepository.find({
      where: { userEmail },
      relations: ['room', 'room.owner'],
    });

    const roomsWithData = await Promise.all(
      accessEntries.map(async (entry) => {
        const room = entry.room;
        if (!room || !room.isActive) return null;

        const itemCount = await this.sharedItemRepository.count({
          where: { roomId: room.id },
        });

        return {
          id: room.id,
          name: room.name,
          description: room.description,
          owner: {
            name: room.owner.name,
            avatar: room.owner.avatar,
          },
          shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/room/${room.shareToken}`,
          viewCount: room.viewCount,
          itemCount,
          sharedAt: entry.grantedAt,
          createdAt: room.createdAt,
          permissions: {
            canCreate: entry.canCreate,
            canUpdate: entry.canUpdate,
            canDelete: entry.canDelete,
            canShare: entry.canShare,
            canViewPasswords: entry.canViewPasswords,
          }
        };
      }),
    );

    return roomsWithData.filter((room) => room !== null);
  }

  async addUserToRoom(ownerId: string, roomId: string, dto: any) {
    const { userEmail, canCreate, canUpdate, canDelete, canShare, canViewPasswords } = dto;

    const room = await this.roomRepository.findOne({
      where: { id: roomId, ownerId },
    });

    if (!room) {
      throw new NotFoundException('Room not found or you do not own it');
    }

    const user = await this.userRepository.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new NotFoundException('User with that email does not exist');
    }

    const existing = await this.accessListRepository.findOne({
      where: { roomId, userEmail },
    });

    if (existing) {
      throw new BadRequestException('User already has access to this room');
    }

    const accessEntry = this.accessListRepository.create({
      roomId,
      userEmail,
      canCreate: canCreate || false,
      canUpdate: canUpdate || false,
      canDelete: canDelete || false,
      canShare: canShare || false,
      canViewPasswords: canViewPasswords || false,
    });

    await this.accessListRepository.save(accessEntry);

    return { message: 'User added to room successfully', userEmail };
  }

  async removeUserFromRoom(ownerId: string, roomId: string, userEmail: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId, ownerId },
    });

    if (!room) {
      throw new NotFoundException('Room not found or you do not own it');
    }

    const accessEntry = await this.accessListRepository.findOne({
      where: { roomId, userEmail },
    });

    if (!accessEntry) {
      throw new NotFoundException('User does not have access to this room');
    }

    await this.accessListRepository.remove(accessEntry);

    return { message: 'User removed from room successfully' };
  }

  async checkAccess(roomId: string, userEmail: string): Promise<boolean> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId, isActive: true },
    });

    if (!room) return false;

    if (room.isPublic) return true;

    const owner = await this.userRepository.findOne({
      where: { id: room.ownerId },
    });
    if (owner && owner.email === userEmail) return true;

    const accessEntry = await this.accessListRepository.findOne({
      where: { roomId, userEmail },
    });

    return accessEntry !== null;
  }

  async getRoomAccessList(ownerId: string, roomId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId, ownerId },
    });

    if (!room) {
      throw new NotFoundException('Room not found or you do not own it');
    }

    const accessEntries = await this.accessListRepository.find({
      where: { roomId },
      order: { grantedAt: 'DESC' },
    });

    return accessEntries.map((entry) => ({
      id: entry.id,
      email: entry.userEmail,
      addedAt: entry.grantedAt,
      canCreate: entry.canCreate,
      canUpdate: entry.canUpdate,
      canDelete: entry.canDelete,
      canShare: entry.canShare,
      canViewPasswords: entry.canViewPasswords,
    }));
  }

  async updateUserPermissions(
    ownerId: string,
    roomId: string,
    userEmail: string,
    permissions: { canCreate?: boolean; canUpdate?: boolean; canDelete?: boolean; canShare?: boolean; canViewPasswords?: boolean },
  ) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId, ownerId },
    });

    if (!room) {
      throw new NotFoundException('Room not found or you do not own it');
    }

    const accessEntry = await this.accessListRepository.findOne({
      where: { roomId, userEmail },
    });

    if (!accessEntry) {
      throw new NotFoundException('User not found in room access list');
    }

    // Update permissions
    if (permissions.canCreate !== undefined) accessEntry.canCreate = permissions.canCreate;
    if (permissions.canUpdate !== undefined) accessEntry.canUpdate = permissions.canUpdate;
    if (permissions.canDelete !== undefined) accessEntry.canDelete = permissions.canDelete;
    if (permissions.canShare !== undefined) accessEntry.canShare = permissions.canShare;
    if (permissions.canViewPasswords !== undefined) accessEntry.canViewPasswords = permissions.canViewPasswords;

    await this.accessListRepository.save(accessEntry);

    return { success: true, message: 'Permissions updated successfully' };
  }

  async updateItemPermissions(userId: string, roomId: string, sharedItemId: string, dto: UpdateItemPermissionsDto) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.ownerId !== userId) {
      throw new ForbiddenException('Only room owner can modify item permissions');
    }

    const sharedItem = await this.sharedItemRepository.findOne({
      where: { id: sharedItemId, roomId },
    });

    if (!sharedItem) {
      throw new NotFoundException('Item not found in this room');
    }

    await this.itemPermissionRepository.delete({ sharedItemId });

    if (dto.permissions && dto.permissions.length > 0) {
      for (const perm of dto.permissions) {
        const itemPermission = this.itemPermissionRepository.create({
          sharedItemId,
          userEmail: perm.userEmail,
          canView: perm.canView,
          canEdit: perm.canEdit,
        });
        await this.itemPermissionRepository.save(itemPermission);
      }
    }

    return { success: true };
  }

  async unlockSharedPassword(userId: string, roomId: string, sharedItemId: string, masterPassword: string) {
    // Verify the room exists and user has access
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Only room owner can unlock passwords
    if (room.ownerId !== userId) {
      throw new ForbiddenException('Only room owner can unlock shared passwords');
    }

    // Find the shared item
    const sharedItem = await this.sharedItemRepository.findOne({
      where: { id: sharedItemId, roomId },
    });

    if (!sharedItem) {
      throw new NotFoundException('Shared item not found');
    }

    if (sharedItem.itemType !== 'password') {
      throw new BadRequestException('This item is not a password');
    }

    // Get the password entity
    const passwordEntity = await this.passwordRepository.findOne({
      where: { id: sharedItem.itemId },
    });

    if (!passwordEntity) {
      throw new NotFoundException('Password not found');
    }

    // Verify master password
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.masterPasswordHash) {
      throw new BadRequestException('Master password not set');
    }

    const isValid = await this.encryptionService.verifyMasterPassword(
      masterPassword,
      user.masterPasswordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid master password');
    }

    // Decrypt the password
    try {
      const [encryptedData, authTag] = passwordEntity.encryptedData.split(':');
      const decryptedData = this.encryptionService.decrypt(
        encryptedData,
        passwordEntity.iv,
        authTag,
        masterPassword,
        passwordEntity.salt,
      );

      // Update the shared item with the decrypted password
      sharedItem.sharedPassword = decryptedData.password;
      await this.sharedItemRepository.save(sharedItem);

      return { success: true, message: 'Password unlocked successfully' };
    } catch (error) {
      throw new UnauthorizedException('Failed to decrypt password');
    }
  }

  async updateSharedPassword(userId: string, userEmail: string, roomId: string, sharedItemId: string, newPassword: string) {
    // Verify the room exists
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is owner or has edit permission
    const isOwner = room.ownerId === userId;
    
    if (!isOwner) {
      // Check access list for edit permission
      const access = await this.accessListRepository.findOne({
        where: { roomId, userEmail },
      });

      if (!access || !access.canUpdate) {
        throw new ForbiddenException('You do not have permission to edit passwords in this room');
      }
    }

    // Find the shared item
    const sharedItem = await this.sharedItemRepository.findOne({
      where: { id: sharedItemId, roomId },
    });

    if (!sharedItem) {
      throw new NotFoundException('Shared item not found');
    }

    if (sharedItem.itemType !== 'password') {
      throw new BadRequestException('This item is not a password');
    }

    // Update the shared password
    sharedItem.sharedPassword = newPassword;
    await this.sharedItemRepository.save(sharedItem);

    return { success: true, message: 'Password updated successfully' };
  }
}
