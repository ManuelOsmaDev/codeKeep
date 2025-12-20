import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
          itemData = await this.passwordRepository.findOne({
            where: { id: item.itemId },
          });
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
          itemData = await this.passwordRepository.findOne({
            where: { id: item.itemId },
          });
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
}
