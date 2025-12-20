import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { Version } from './entities/version.entity';
import { Project } from './entities/project.entity';
import { TaskState } from './entities/task-state.entity';
import { Activity } from './entities/activity.entity';
import { SprintBacklog } from './entities/sprint-backlog.entity';
import { SprintBacklogActivity } from './entities/sprint-backlog-activity.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { CreateVersionDto, UpdateVersionDto } from './dto/version.dto';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateActivityDto, UpdateActivityDto, MoveActivityDto } from './dto/activity.dto';
import { CreateSprintBacklogDto, UpdateSprintBacklogDto, AssignActivityToSprintDto } from './dto/sprint-backlog.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { CreateTaskStateDto } from './dto/task-state.dto';

const DEFAULT_STATES = [
  { nombre: 'Backlog', orden: 0, color: '#6366f1' },
  { nombre: 'To Do', orden: 1, color: '#f59e0b' },
  { nombre: 'In Progress', orden: 2, color: '#3b82f6' },
  { nombre: 'Done', orden: 3, color: '#22c55e' },
];

@Injectable()
export class ScrumService implements OnModuleInit {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Version)
    private versionRepository: Repository<Version>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(TaskState)
    private taskStateRepository: Repository<TaskState>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(SprintBacklog)
    private sprintBacklogRepository: Repository<SprintBacklog>,
    @InjectRepository(SprintBacklogActivity)
    private sprintBacklogActivityRepository: Repository<SprintBacklogActivity>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Crear estados por defecto si no existen
    const statesCount = await this.taskStateRepository.count();
    if (statesCount === 0) {
      for (const state of DEFAULT_STATES) {
        const newState = this.taskStateRepository.create(state);
        await this.taskStateRepository.save(newState);
      }
    }
  }

  // ==================== USERS ====================
  async getUsers() {
    return this.userRepository.find({
      select: ['id', 'name', 'email'],
      order: { name: 'ASC' },
    });
  }

  // ==================== TASK STATES ====================
  async getTaskStates() {
    return this.taskStateRepository.find({ order: { orden: 'ASC' } });
  }

  async createTaskState(dto: CreateTaskStateDto) {
    const state = this.taskStateRepository.create(dto);
    return this.taskStateRepository.save(state);
  }

  // ==================== APPLICATIONS ====================
  async getApplications(userId: string) {
    return this.applicationRepository.find({
      where: { userId },
      relations: ['versiones'],
      order: { createdAt: 'DESC' },
    });
  }

  async getApplication(id: string, userId: string) {
    const app = await this.applicationRepository.findOne({
      where: { id, userId },
      relations: ['versiones', 'versiones.projects'],
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async createApplication(userId: string, dto: CreateApplicationDto) {
    const app = this.applicationRepository.create({
      ...dto,
      userId,
    });
    return this.applicationRepository.save(app);
  }

  async updateApplication(id: string, userId: string, dto: UpdateApplicationDto) {
    const app = await this.applicationRepository.findOne({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');
    Object.assign(app, dto);
    return this.applicationRepository.save(app);
  }

  async deleteApplication(id: string, userId: string) {
    const app = await this.applicationRepository.findOne({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');
    await this.applicationRepository.remove(app);
    return { message: 'Application deleted successfully' };
  }

  // ==================== VERSIONS ====================
  async getVersions(applicationId: string, userId: string) {
    const app = await this.applicationRepository.findOne({ where: { id: applicationId, userId } });
    if (!app) throw new NotFoundException('Application not found');
    return this.versionRepository.find({
      where: { applicationId },
      relations: ['projects'],
      order: { createdAt: 'DESC' },
    });
  }

  async createVersion(userId: string, dto: CreateVersionDto) {
    const app = await this.applicationRepository.findOne({ where: { id: dto.applicationId, userId } });
    if (!app) throw new NotFoundException('Application not found');
    const version = this.versionRepository.create(dto);
    return this.versionRepository.save(version);
  }

  async updateVersion(id: string, userId: string, dto: UpdateVersionDto) {
    const version = await this.versionRepository.findOne({
      where: { id },
      relations: ['application'],
    });
    if (!version || version.application.userId !== userId) {
      throw new NotFoundException('Version not found');
    }
    Object.assign(version, dto);
    return this.versionRepository.save(version);
  }

  async deleteVersion(id: string, userId: string) {
    const version = await this.versionRepository.findOne({
      where: { id },
      relations: ['application'],
    });
    if (!version || version.application.userId !== userId) {
      throw new NotFoundException('Version not found');
    }
    await this.versionRepository.remove(version);
    return { message: 'Version deleted successfully' };
  }

  // ==================== PROJECTS ====================
  async getProjects(versionId: string, userId: string) {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
      relations: ['application'],
    });
    if (!version || version.application.userId !== userId) {
      throw new NotFoundException('Version not found');
    }
    return this.projectRepository.find({
      where: { versionId },
      relations: ['sprintBacklogs', 'activities'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProject(id: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['version', 'version.application', 'sprintBacklogs', 'activities', 'activities.state', 'activities.user'],
    });
    if (!project || project.version.application.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async createProject(userId: string, dto: CreateProjectDto) {
    const version = await this.versionRepository.findOne({
      where: { id: dto.versionId },
      relations: ['application'],
    });
    if (!version || version.application.userId !== userId) {
      throw new NotFoundException('Version not found');
    }
    const project = this.projectRepository.create(dto);
    return this.projectRepository.save(project);
  }

  async updateProject(id: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['version', 'version.application'],
    });
    if (!project || project.version.application.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async deleteProject(id: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['version', 'version.application'],
    });
    if (!project || project.version.application.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    await this.projectRepository.remove(project);
    return { message: 'Project deleted successfully' };
  }

  // ==================== ACTIVITIES ====================
  async getActivitiesByProject(projectId: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['version', 'version.application'],
    });
    if (!project || project.version.application.userId !== userId) {
      throw new NotFoundException('Project not found');
    }

    const activities = await this.activityRepository.find({
      where: { projectId },
      relations: ['state', 'user', 'comments'],
      order: { orden: 'ASC' },
    });

    // Organizar por estado
    const states = await this.taskStateRepository.find({ order: { orden: 'ASC' } });
    const activitiesByState: Record<string, typeof activities> = {};
    
    for (const state of states) {
      activitiesByState[state.id] = activities.filter(a => a.stateId === state.id);
    }

    return {
      states,
      activitiesByState,
      project,
    };
  }

  async createActivity(userId: string, dto: CreateActivityDto) {
    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId },
      relations: ['version', 'version.application'],
    });
    if (!project || project.version.application.userId !== userId) {
      throw new NotFoundException('Project not found');
    }

    // Obtener el máximo orden en el estado
    const maxOrder = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.projectId = :projectId', { projectId: dto.projectId })
      .andWhere('activity.stateId = :stateId', { stateId: dto.stateId })
      .select('MAX(activity.orden)', 'max')
      .getRawOne();

    const activity = this.activityRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      orden: (maxOrder?.max ?? -1) + 1,
    });

    return this.activityRepository.save(activity);
  }

  async updateActivity(id: string, userId: string, dto: UpdateActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!activity || activity.project.version.application.userId !== userId) {
      throw new NotFoundException('Activity not found');
    }
    Object.assign(activity, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : activity.dueDate,
    });
    return this.activityRepository.save(activity);
  }

  async moveActivity(id: string, userId: string, dto: MoveActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!activity || activity.project.version.application.userId !== userId) {
      throw new NotFoundException('Activity not found');
    }

    const oldStateId = activity.stateId;
    const oldOrder = activity.orden;

    // Si cambia de estado
    if (oldStateId !== dto.stateId) {
      // Reordenar estado antiguo
      await this.activityRepository
        .createQueryBuilder()
        .update(Activity)
        .set({ orden: () => 'orden - 1' })
        .where('projectId = :projectId', { projectId: activity.projectId })
        .andWhere('stateId = :stateId', { stateId: oldStateId })
        .andWhere('orden > :oldOrder', { oldOrder })
        .execute();

      // Hacer espacio en el nuevo estado
      await this.activityRepository
        .createQueryBuilder()
        .update(Activity)
        .set({ orden: () => 'orden + 1' })
        .where('projectId = :projectId', { projectId: activity.projectId })
        .andWhere('stateId = :stateId', { stateId: dto.stateId })
        .andWhere('orden >= :newOrder', { newOrder: dto.orden })
        .execute();
    } else {
      // Mismo estado, solo reordenar
      if (dto.orden > oldOrder) {
        await this.activityRepository
          .createQueryBuilder()
          .update(Activity)
          .set({ orden: () => 'orden - 1' })
          .where('projectId = :projectId', { projectId: activity.projectId })
          .andWhere('stateId = :stateId', { stateId: dto.stateId })
          .andWhere('orden > :oldOrder', { oldOrder })
          .andWhere('orden <= :newOrder', { newOrder: dto.orden })
          .execute();
      } else if (dto.orden < oldOrder) {
        await this.activityRepository
          .createQueryBuilder()
          .update(Activity)
          .set({ orden: () => 'orden + 1' })
          .where('projectId = :projectId', { projectId: activity.projectId })
          .andWhere('stateId = :stateId', { stateId: dto.stateId })
          .andWhere('orden >= :newOrder', { newOrder: dto.orden })
          .andWhere('orden < :oldOrder', { oldOrder })
          .execute();
      }
    }

    activity.stateId = dto.stateId;
    activity.orden = dto.orden;
    return this.activityRepository.save(activity);
  }

  async deleteActivity(id: string, userId: string) {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!activity || activity.project.version.application.userId !== userId) {
      throw new NotFoundException('Activity not found');
    }

    // Reordenar las demás actividades
    await this.activityRepository
      .createQueryBuilder()
      .update(Activity)
      .set({ orden: () => 'orden - 1' })
      .where('projectId = :projectId', { projectId: activity.projectId })
      .andWhere('stateId = :stateId', { stateId: activity.stateId })
      .andWhere('orden > :orden', { orden: activity.orden })
      .execute();

    await this.activityRepository.remove(activity);
    return { message: 'Activity deleted successfully' };
  }

  // ==================== SPRINT BACKLOGS ====================
  async getSprintBacklogs(projectId: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['version', 'version.application'],
    });
    if (!project || project.version.application.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    return this.sprintBacklogRepository.find({
      where: { projectId },
      relations: ['state', 'sprintBacklogActivities', 'sprintBacklogActivities.activity'],
    });
  }

  async createSprintBacklog(userId: string, dto: CreateSprintBacklogDto) {
    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId },
      relations: ['version', 'version.application'],
    });
    if (!project || project.version.application.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    const sprint = this.sprintBacklogRepository.create({
      ...dto,
      fechaInicio: new Date(dto.fechaInicio),
      fechaFin: new Date(dto.fechaFin),
    });
    return this.sprintBacklogRepository.save(sprint);
  }

  async updateSprintBacklog(id: string, userId: string, dto: UpdateSprintBacklogDto) {
    const sprint = await this.sprintBacklogRepository.findOne({
      where: { id },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!sprint || sprint.project.version.application.userId !== userId) {
      throw new NotFoundException('Sprint backlog not found');
    }
    Object.assign(sprint, {
      ...dto,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : sprint.fechaInicio,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : sprint.fechaFin,
    });
    return this.sprintBacklogRepository.save(sprint);
  }

  async deleteSprintBacklog(id: string, userId: string) {
    const sprint = await this.sprintBacklogRepository.findOne({
      where: { id },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!sprint || sprint.project.version.application.userId !== userId) {
      throw new NotFoundException('Sprint backlog not found');
    }
    await this.sprintBacklogRepository.remove(sprint);
    return { message: 'Sprint backlog deleted successfully' };
  }

  async assignActivityToSprint(userId: string, dto: AssignActivityToSprintDto) {
    const activity = await this.activityRepository.findOne({
      where: { id: dto.activityId },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!activity || activity.project.version.application.userId !== userId) {
      throw new NotFoundException('Activity not found');
    }

    const sprint = await this.sprintBacklogRepository.findOne({
      where: { id: dto.sprintBacklogId },
    });
    if (!sprint) throw new NotFoundException('Sprint backlog not found');

    const assignment = this.sprintBacklogActivityRepository.create({
      activityId: dto.activityId,
      sprintBacklogId: dto.sprintBacklogId,
    });
    return this.sprintBacklogActivityRepository.save(assignment);
  }

  async removeActivityFromSprint(id: string, userId: string) {
    const assignment = await this.sprintBacklogActivityRepository.findOne({
      where: { id },
      relations: ['activity', 'activity.project', 'activity.project.version', 'activity.project.version.application'],
    });
    if (!assignment || assignment.activity.project.version.application.userId !== userId) {
      throw new NotFoundException('Assignment not found');
    }
    await this.sprintBacklogActivityRepository.remove(assignment);
    return { message: 'Activity removed from sprint' };
  }

  // ==================== COMMENTS ====================
  async getComments(activityId: string, userId: string) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!activity || activity.project.version.application.userId !== userId) {
      throw new NotFoundException('Activity not found');
    }
    return this.commentRepository.find({
      where: { activityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async createComment(userId: string, dto: CreateCommentDto) {
    const activity = await this.activityRepository.findOne({
      where: { id: dto.activityId },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!activity || activity.project.version.application.userId !== userId) {
      throw new NotFoundException('Activity not found');
    }
    const comment = this.commentRepository.create({
      ...dto,
      userId,
    });
    return this.commentRepository.save(comment);
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, userId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
