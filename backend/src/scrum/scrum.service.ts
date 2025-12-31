import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
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
import { ProjectMember } from './entities/project-member.entity';
import { ProjectInvitation } from './entities/project-invitation.entity';
import { ScrumMember } from './entities/scrum-member.entity';
import { ScrumInvitation } from './entities/scrum-invitation.entity';
import { User } from '../users/entities/user.entity';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { CreateVersionDto, UpdateVersionDto } from './dto/version.dto';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateActivityDto, UpdateActivityDto, MoveActivityDto } from './dto/activity.dto';
import { CreateSprintBacklogDto, UpdateSprintBacklogDto, AssignActivityToSprintDto } from './dto/sprint-backlog.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { CreateTaskStateDto } from './dto/task-state.dto';
import { InviteMemberDto, UpdateMemberRoleDto } from './dto/project-member.dto';
import { randomBytes } from 'crypto';

const DEFAULT_STATES = [
  { nombre: 'Backlog', orden: 0, color: '#6366f1' },
  { nombre: 'To Do', orden: 1, color: '#f59e0b' },
  { nombre: 'In Progress', orden: 2, color: '#3b82f6' },
  { nombre: 'Testing', orden: 3, color: '#a855f7' },
  { nombre: 'Done', orden: 4, color: '#22c55e' },
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
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectInvitation)
    private projectInvitationRepository: Repository<ProjectInvitation>,
    @InjectRepository(ScrumMember)
    private scrumMemberRepository: Repository<ScrumMember>,
    @InjectRepository(ScrumInvitation)
    private scrumInvitationRepository: Repository<ScrumInvitation>,
  ) { }

  async onModuleInit() {
    // Ensure default states exist
    for (const state of DEFAULT_STATES) {
      const exists = await this.taskStateRepository.findOne({ where: { nombre: state.nombre } });
      if (!exists) {
        const newState = this.taskStateRepository.create(state);
        await this.taskStateRepository.save(newState);
      } else {
        // Update order/color if changed
        exists.orden = state.orden;
        exists.color = state.color;
        await this.taskStateRepository.save(exists);
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
      relations: [
        'version',
        'version.application',
        'sprintBacklogs',
        'activities',
        'activities.state',
        'activities.user',
        'activities.sprintBacklogActivities',
        'activities.sprintBacklogActivities.sprintBacklog'
      ],
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
    const savedProject = await this.projectRepository.save(project);

    // Auto-add owner as project member
    const ownerMember = this.projectMemberRepository.create({
      userId,
      projectId: savedProject.id,
      role: 'owner',
    });
    await this.projectMemberRepository.save(ownerMember);

    return savedProject;
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
    // Use verifyProjectAccess to allow both owners and members
    const { project } = await this.verifyProjectAccess(projectId, userId);

    const activities = await this.activityRepository.find({
      where: { projectId },
      relations: ['state', 'user', 'comments', 'sprintBacklogActivities', 'sprintBacklogActivities.sprintBacklog'],
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
    // Use verifyProjectAccess to allow both owners and members
    await this.verifyProjectAccess(dto.projectId, userId);

    // Obtener el máximo orden en el estado
    const maxOrder = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.projectId = :projectId', { projectId: dto.projectId })
      .andWhere('activity.stateId = :stateId', { stateId: dto.stateId })
      .select('MAX(activity.orden)', 'max')
      .getRawOne();

    // Parse date in local timezone to avoid timezone conversion issues
    let parsedDueDate = null;
    if (dto.dueDate) {
      // If date is in format YYYY-MM-DD, parse it as local date
      const dateStr = dto.dueDate.toString();
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        parsedDueDate = new Date(year, month - 1, day);
      } else {
        parsedDueDate = new Date(dto.dueDate);
      }
    }

    const activity = this.activityRepository.create({
      ...dto,
      dueDate: parsedDueDate,
      orden: (maxOrder?.max ?? -1) + 1,
    });

    return this.activityRepository.save(activity);
  }

  async updateActivity(id: string, userId: string, dto: UpdateActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!activity) throw new NotFoundException('Activity not found');

    // Verify user has access to this project
    await this.verifyProjectAccess(activity.projectId, userId);
    // Parse date in local timezone to avoid timezone conversion issues
    let parsedDueDate = activity.dueDate;
    if (dto.dueDate !== undefined) {
      if (dto.dueDate) {
        const dateStr = dto.dueDate.toString();
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          parsedDueDate = new Date(year, month - 1, day);
        } else {
          parsedDueDate = new Date(dto.dueDate);
        }
      } else {
        parsedDueDate = null;
      }
    }

    Object.assign(activity, {
      ...dto,
      dueDate: parsedDueDate,
    });
    return this.activityRepository.save(activity);
  }

  async moveActivity(id: string, userId: string, dto: MoveActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!activity) throw new NotFoundException('Activity not found');

    // Verify user has access to this project
    await this.verifyProjectAccess(activity.projectId, userId);

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
    if (!activity) throw new NotFoundException('Activity not found');

    // Verify user has access to this project
    await this.verifyProjectAccess(activity.projectId, userId);

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
    // Use verifyProjectAccess to allow both owners and members
    await this.verifyProjectAccess(projectId, userId);
    return this.sprintBacklogRepository.find({
      where: { projectId },
      relations: ['state', 'sprintBacklogActivities', 'sprintBacklogActivities.activity', 'comments'],
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

    // Helper to ensure date is stored as Noon UTC to avoid timezone truncation issues
    const toNoonUTC = (dateVal: string | Date | undefined) => {
      if (!dateVal) return new Date();
      // Get ISO string part YYYY-MM-DD
      const s = dateVal instanceof Date ? dateVal.toISOString() : dateVal.toString();
      const datePart = s.split('T')[0];
      // Construct Noon UTC date
      if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(`${datePart}T12:00:00Z`);
      }
      return new Date(dateVal);
    };

    const sprint = this.sprintBacklogRepository.create({
      ...dto,
      fechaInicio: toNoonUTC(dto.fechaInicio),
      fechaFin: toNoonUTC(dto.fechaFin),
    });
    const savedSprint = await this.sprintBacklogRepository.save(sprint);

    if (dto.activityIds && dto.activityIds.length > 0) {
      const assignments = dto.activityIds.map((activityId) =>
        this.sprintBacklogActivityRepository.create({
          sprintBacklogId: savedSprint.id,
          activityId,
        }),
      );
      await this.sprintBacklogActivityRepository.save(assignments);
    }

    return savedSprint;
  }

  async updateSprintBacklog(id: string, userId: string, dto: UpdateSprintBacklogDto) {
    const sprint = await this.sprintBacklogRepository.findOne({
      where: { id },
      relations: ['project', 'project.version', 'project.version.application'],
    });
    if (!sprint || sprint.project.version.application.userId !== userId) {
      throw new NotFoundException('Sprint backlog not found');
    }

    // Helper to ensure date is stored as Noon UTC to avoid timezone truncation issues
    const toNoonUTC = (dateVal: string | Date | undefined) => {
      if (!dateVal) return undefined;
      // Get ISO string part YYYY-MM-DD
      const s = dateVal instanceof Date ? dateVal.toISOString() : dateVal.toString();
      const datePart = s.split('T')[0];
      // Construct Noon UTC date
      if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(`${datePart}T12:00:00Z`);
      }
      return new Date(dateVal);
    };

    Object.assign(sprint, {
      ...dto,
      fechaInicio: dto.fechaInicio ? toNoonUTC(dto.fechaInicio) : sprint.fechaInicio,
      fechaFin: dto.fechaFin ? toNoonUTC(dto.fechaFin) : sprint.fechaFin,
    });
    const savedSprint = await this.sprintBacklogRepository.save(sprint);

    if (dto.activityIds) {
      // Remove existing assignments
      await this.sprintBacklogActivityRepository.delete({ sprintBacklogId: id });

      // Add new assignments
      if (dto.activityIds.length > 0) {
        const assignments = dto.activityIds.map((activityId) =>
          this.sprintBacklogActivityRepository.create({
            sprintBacklogId: id,
            activityId,
          }),
        );
        await this.sprintBacklogActivityRepository.save(assignments);
      }
    }

    return savedSprint;
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
  async getComments(resourceId: string, userId: string) {
    // Check if it's an activity
    const activity = await this.activityRepository.findOne({
      where: { id: resourceId },
    });

    if (activity) {
      await this.verifyProjectAccess(activity.projectId, userId);
      return this.commentRepository.find({
        where: { activityId: resourceId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    }

    // Check if it's a sprint
    const sprint = await this.sprintBacklogRepository.findOne({
      where: { id: resourceId },
    });

    if (sprint) {
      await this.verifyProjectAccess(sprint.projectId, userId);
      return this.commentRepository.find({
        where: { sprintId: resourceId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    }

    throw new NotFoundException('Resource not found');
  }

  async createComment(userId: string, dto: CreateCommentDto) {
    if (dto.activityId) {
      const activity = await this.activityRepository.findOne({
        where: { id: dto.activityId },
      });
      if (!activity) throw new NotFoundException('Activity not found');
      await this.verifyProjectAccess(activity.projectId, userId);
    } else if (dto.sprintId) {
      const sprint = await this.sprintBacklogRepository.findOne({
        where: { id: dto.sprintId },
      });
      if (!sprint) throw new NotFoundException('Sprint not found');
      await this.verifyProjectAccess(sprint.projectId, userId);
    } else {
      throw new BadRequestException('Activity ID or Sprint ID is required');
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

  // ==================== PROJECT MEMBERS & INVITATIONS ====================

  // Helper to check if user has access (from project, version, or application level)
  private async verifyProjectAccess(projectId: string, userId: string, requireOwner = false) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['version', 'version.application'],
    });
    if (!project) throw new NotFoundException('Project not found');

    const isAppOwner = project.version.application.userId === userId;

    // Check direct project membership (old system)
    const projectMember = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    // Check unified membership at project, version, or application level
    const scrumMemberProject = await this.scrumMemberRepository.findOne({
      where: { userId, resourceType: 'project', resourceId: projectId },
    });
    const scrumMemberVersion = await this.scrumMemberRepository.findOne({
      where: { userId, resourceType: 'version', resourceId: project.versionId },
    });
    const scrumMemberApp = await this.scrumMemberRepository.findOne({
      where: { userId, resourceType: 'application', resourceId: project.version.applicationId },
    });

    const hasMembership = projectMember || scrumMemberProject || scrumMemberVersion || scrumMemberApp;
    const memberRole = projectMember?.role || scrumMemberProject?.role || scrumMemberVersion?.role || scrumMemberApp?.role;

    if (requireOwner) {
      if (!isAppOwner && memberRole !== 'owner') {
        throw new BadRequestException('Only project owner can perform this action');
      }
    } else {
      if (!isAppOwner && !hasMembership) {
        throw new BadRequestException('You are not a member of this project');
      }
    }

    return { project, member: projectMember, isAppOwner, memberRole };
  }

  // Get project members
  async getProjectMembers(projectId: string, userId: string) {
    await this.verifyProjectAccess(projectId, userId);

    return this.projectMemberRepository.find({
      where: { projectId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  // Get projects where user is a member (shared with me) - excludes projects user owns
  async getSharedProjects(userId: string) {
    const memberships = await this.projectMemberRepository.find({
      where: { userId },
      relations: ['project', 'project.version', 'project.version.application', 'project.version.application.user'],
    });

    // Filter out projects where user is the application owner
    return memberships
      .filter(m => m.project?.version?.application?.userId !== userId)
      .map(m => ({
        ...m.project,
        role: m.role,
        joinedAt: m.joinedAt,
        ownerName: m.project?.version?.application?.user?.name || 'Unknown',
      }));
  }

  // Get users available for task assignment (only project members)
  async getProjectUsers(projectId: string, userId: string) {
    await this.verifyProjectAccess(projectId, userId);

    const members = await this.projectMemberRepository.find({
      where: { projectId },
      relations: ['user'],
    });

    return members.map(m => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    }));
  }

  // Invite a user to project
  async inviteToProject(userId: string, projectId: string, dto: InviteMemberDto) {
    const { project } = await this.verifyProjectAccess(projectId, userId);

    // Check if user is already a member
    const existingMember = await this.projectMemberRepository.findOne({
      where: { projectId },
      relations: ['user'],
    });

    const targetUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (targetUser) {
      const alreadyMember = await this.projectMemberRepository.findOne({
        where: { projectId, userId: targetUser.id },
      });
      if (alreadyMember) {
        throw new BadRequestException('User is already a member of this project');
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await this.projectInvitationRepository.findOne({
      where: { projectId, email: dto.email, status: 'pending' },
    });
    if (existingInvitation) {
      throw new BadRequestException('An invitation is already pending for this email');
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invitation = this.projectInvitationRepository.create({
      email: dto.email.toLowerCase(),
      projectId,
      token,
      invitedById: userId,
      expiresAt,
    });

    await this.projectInvitationRepository.save(invitation);

    return {
      message: 'Invitation sent successfully',
      email: dto.email,
      expiresAt,
    };
  }

  // Get pending invitations for current user
  async getPendingInvitations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const invitations = await this.projectInvitationRepository.find({
      where: { email: user.email, status: 'pending' },
      relations: ['project', 'project.version', 'project.version.application', 'invitedBy'],
      order: { createdAt: 'DESC' },
    });

    // Filter out expired invitations
    const now = new Date();
    return invitations.filter(inv => new Date(inv.expiresAt) > now);
  }

  // Accept invitation
  async acceptInvitation(userId: string, token: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const invitation = await this.projectInvitationRepository.findOne({
      where: { token, email: user.email, status: 'pending' },
      relations: ['project'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already processed');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      invitation.status = 'expired';
      await this.projectInvitationRepository.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    // Add user as project member
    const member = this.projectMemberRepository.create({
      userId,
      projectId: invitation.projectId,
      role: 'member',
    });
    await this.projectMemberRepository.save(member);

    // Update invitation status
    invitation.status = 'accepted';
    await this.projectInvitationRepository.save(invitation);

    return {
      message: 'Invitation accepted successfully',
      project: invitation.project,
    };
  }

  // Reject invitation
  async rejectInvitation(userId: string, token: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const invitation = await this.projectInvitationRepository.findOne({
      where: { token, email: user.email, status: 'pending' },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already processed');
    }

    invitation.status = 'rejected';
    await this.projectInvitationRepository.save(invitation);

    return { message: 'Invitation rejected' };
  }

  // Remove member from project
  async removeMember(userId: string, projectId: string, targetUserId: string) {
    const { member } = await this.verifyProjectAccess(projectId, userId);

    // Only owner/admin can remove members
    if (member?.role !== 'owner' && member?.role !== 'admin') {
      throw new BadRequestException('Only project owner or admin can remove members');
    }

    const targetMember = await this.projectMemberRepository.findOne({
      where: { projectId, userId: targetUserId },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    if (targetMember.role === 'owner') {
      throw new BadRequestException('Cannot remove project owner');
    }

    await this.projectMemberRepository.remove(targetMember);

    return { message: 'Member removed successfully' };
  }

  // Update member role
  async updateMemberRole(userId: string, projectId: string, targetUserId: string, dto: UpdateMemberRoleDto) {
    await this.verifyProjectAccess(projectId, userId, true); // Only owner

    const targetMember = await this.projectMemberRepository.findOne({
      where: { projectId, userId: targetUserId },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    if (targetMember.role === 'owner') {
      throw new BadRequestException('Cannot change owner role');
    }

    targetMember.role = dto.role;
    await this.projectMemberRepository.save(targetMember);

    return { message: 'Role updated successfully' };
  }

  // ==================== UNIFIED MULTI-LEVEL INVITATIONS ====================

  // Send invitation at any level (application, version, or project)
  async sendInvitation(userId: string, dto: InviteMemberDto) {
    const { resourceType, resourceId, email } = dto;

    // Verify user has permission to invite
    let resourceName = '';
    if (resourceType === 'project') {
      const { project } = await this.verifyProjectAccess(resourceId, userId);
      resourceName = project.nombre;
    } else if (resourceType === 'version') {
      const version = await this.versionRepository.findOne({
        where: { id: resourceId },
        relations: ['application'],
      });
      if (!version || version.application.userId !== userId) {
        throw new BadRequestException('Version not found or access denied');
      }
      resourceName = version.nombre;
    } else if (resourceType === 'application') {
      const app = await this.applicationRepository.findOne({
        where: { id: resourceId },
      });
      if (!app || app.userId !== userId) {
        throw new BadRequestException('Application not found or access denied');
      }
      resourceName = app.nombre;
    }

    // Check if already a member
    const existingMember = await this.scrumMemberRepository.findOne({
      where: { resourceType, resourceId, user: { email: email.toLowerCase() } },
      relations: ['user'],
    });
    if (existingMember) {
      throw new BadRequestException('User is already a member');
    }

    // Check for pending invitation
    const existingInvitation = await this.scrumInvitationRepository.findOne({
      where: { resourceType, resourceId, email: email.toLowerCase(), status: 'pending' },
    });
    if (existingInvitation) {
      throw new BadRequestException('An invitation is already pending for this email');
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.scrumInvitationRepository.create({
      email: email.toLowerCase(),
      resourceType,
      resourceId,
      resourceName,
      token,
      invitedById: userId,
      expiresAt,
    });

    await this.scrumInvitationRepository.save(invitation);

    return { message: 'Invitation sent successfully', email, expiresAt, resourceType };
  }

  // Get pending invitations for current user (unified)
  async getUnifiedPendingInvitations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const invitations = await this.scrumInvitationRepository.find({
      where: { email: user.email, status: 'pending' },
      relations: ['invitedBy'],
      order: { createdAt: 'DESC' },
    });

    // Filter out expired
    const now = new Date();
    return invitations.filter(inv => new Date(inv.expiresAt) > now);
  }

  // Accept unified invitation
  async acceptUnifiedInvitation(userId: string, token: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const invitation = await this.scrumInvitationRepository.findOne({
      where: { token, email: user.email, status: 'pending' },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already processed');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      invitation.status = 'expired';
      await this.scrumInvitationRepository.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    // Add as member
    const member = this.scrumMemberRepository.create({
      userId,
      resourceType: invitation.resourceType,
      resourceId: invitation.resourceId,
      role: 'member',
    });
    await this.scrumMemberRepository.save(member);

    // Update invitation
    invitation.status = 'accepted';
    await this.scrumInvitationRepository.save(invitation);

    return {
      message: 'Invitation accepted successfully',
      resourceType: invitation.resourceType,
      resourceId: invitation.resourceId,
      resourceName: invitation.resourceName,
    };
  }

  // Reject unified invitation
  async rejectUnifiedInvitation(userId: string, token: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const invitation = await this.scrumInvitationRepository.findOne({
      where: { token, email: user.email, status: 'pending' },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already processed');
    }

    invitation.status = 'rejected';
    await this.scrumInvitationRepository.save(invitation);

    return { message: 'Invitation rejected' };
  }

  // Get all shared resources (apps, versions, projects) for user
  async getSharedResources(userId: string) {
    // Get from new unified ScrumMember system
    const memberships = await this.scrumMemberRepository.find({
      where: { userId },
      order: { joinedAt: 'DESC' },
    });

    const sharedApps = [];
    const sharedVersions = [];
    const sharedProjects = [];
    const seenProjectIds = new Set<string>();

    // Process new ScrumMember entries
    for (const m of memberships) {
      if (m.resourceType === 'application') {
        const app = await this.applicationRepository.findOne({
          where: { id: m.resourceId },
          relations: ['user'],
        });
        if (app && app.userId !== userId) {
          sharedApps.push({ ...app, role: m.role, joinedAt: m.joinedAt, ownerName: app.user?.name });
        }
      } else if (m.resourceType === 'version') {
        const version = await this.versionRepository.findOne({
          where: { id: m.resourceId },
          relations: ['application', 'application.user'],
        });
        if (version && version.application.userId !== userId) {
          sharedVersions.push({ ...version, role: m.role, joinedAt: m.joinedAt, ownerName: version.application.user?.name });
        }
      } else if (m.resourceType === 'project') {
        const project = await this.projectRepository.findOne({
          where: { id: m.resourceId },
          relations: ['version', 'version.application', 'version.application.user'],
        });
        if (project && project.version.application.userId !== userId) {
          sharedProjects.push({ ...project, role: m.role, joinedAt: m.joinedAt, ownerName: project.version.application.user?.name });
          seenProjectIds.add(project.id);
        }
      }
    }

    // Also get from old ProjectMember system (for backwards compatibility)
    const oldMemberships = await this.projectMemberRepository.find({
      where: { userId },
      relations: ['project', 'project.version', 'project.version.application', 'project.version.application.user'],
    });

    for (const m of oldMemberships) {
      if (m.project && m.project.version?.application?.userId !== userId && !seenProjectIds.has(m.project.id)) {
        sharedProjects.push({
          ...m.project,
          role: m.role,
          joinedAt: m.joinedAt,
          ownerName: m.project.version?.application?.user?.name || 'Unknown',
        });
        seenProjectIds.add(m.project.id);
      }
    }

    return { sharedApps, sharedVersions, sharedProjects };
  }
}
