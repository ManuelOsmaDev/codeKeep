import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SnippetsModule } from './snippets/snippets.module';
import { FavoritesModule } from './favorites/favorites.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { User } from './users/entities/user.entity';
import { Snippet } from './snippets/entities/snippet.entity';
import { Password } from './passwords/entities/password.entity';
import { SharedItem } from './sharing/entities/shared-item.entity';
import { SharedRoom } from './sharing/entities/shared-room.entity';
import { RoomAccessList } from './sharing/entities/room-access-list.entity';
import { SharedItemPermission } from './sharing/entities/shared-item-permission.entity';
import { AppController } from './app.controller';
import { PasswordsModule } from './passwords/passwords.module';
import { SharingModule } from './sharing/sharing.module';
import { EncryptionModule } from './encryption/encryption.module';
import { ScrumModule } from './scrum/scrum.module';
import { Application } from './scrum/entities/application.entity';
import { Version } from './scrum/entities/version.entity';
import { Project } from './scrum/entities/project.entity';
import { TaskState } from './scrum/entities/task-state.entity';
import { Activity } from './scrum/entities/activity.entity';
import { SprintBacklog } from './scrum/entities/sprint-backlog.entity';
import { SprintBacklogActivity } from './scrum/entities/sprint-backlog-activity.entity';
import { Comment } from './scrum/entities/comment.entity';
import { ProjectMember } from './scrum/entities/project-member.entity';
import { ProjectInvitation } from './scrum/entities/project-invitation.entity';
import { ScrumMember } from './scrum/entities/scrum-member.entity';
import { ScrumInvitation } from './scrum/entities/scrum-invitation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT'), 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          User,
          Snippet,
          Password,
          SharedItem,
          SharedRoom,
          RoomAccessList,
          SharedItemPermission,
          Application,
          Version,
          Project,
          TaskState,
          Activity,
          SprintBacklog,
          SprintBacklogActivity,
          Comment,
          ProjectMember,
          ProjectInvitation,
          ScrumMember,
          ScrumInvitation,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    SnippetsModule,
    FavoritesModule,
    BookmarksModule,
    GoogleDriveModule,
    PasswordsModule,
    EncryptionModule,
    SharingModule,
    ScrumModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
