import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { SharedRoom } from './entities/shared-room.entity';
import { SharedItem } from './entities/shared-item.entity';
import { RoomAccessList } from './entities/room-access-list.entity';
import { SharedItemPermission } from './entities/shared-item-permission.entity';
import { Snippet } from '../snippets/entities/snippet.entity';
import { Password } from '../passwords/entities/password.entity';
import { User } from '../users/entities/user.entity';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedRoom, SharedItem, RoomAccessList, SharedItemPermission, Snippet, Password, User]),
    EncryptionModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class SharingModule {}
