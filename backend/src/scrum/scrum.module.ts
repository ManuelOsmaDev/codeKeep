import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrumController } from './scrum.controller';
import { ScrumService } from './scrum.service';
import { Application } from './entities/application.entity';
import { Version } from './entities/version.entity';
import { Project } from './entities/project.entity';
import { TaskState } from './entities/task-state.entity';
import { Activity } from './entities/activity.entity';
import { SprintBacklog } from './entities/sprint-backlog.entity';
import { SprintBacklogActivity } from './entities/sprint-backlog-activity.entity';
import { Comment } from './entities/comment.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectInvitation } from './entities/project-invitation.entity';
import { ScrumMember } from './entities/scrum-member.entity';
import { ScrumInvitation } from './entities/scrum-invitation.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      User,
    ]),
  ],
  controllers: [ScrumController],
  providers: [ScrumService],
  exports: [ScrumService],
})
export class ScrumModule {}
