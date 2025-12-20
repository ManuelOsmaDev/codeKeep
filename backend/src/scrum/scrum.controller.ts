import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScrumService } from './scrum.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { CreateVersionDto, UpdateVersionDto } from './dto/version.dto';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateActivityDto, UpdateActivityDto, MoveActivityDto } from './dto/activity.dto';
import { CreateSprintBacklogDto, UpdateSprintBacklogDto, AssignActivityToSprintDto } from './dto/sprint-backlog.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { CreateTaskStateDto } from './dto/task-state.dto';

@Controller('scrum')
@UseGuards(AuthGuard('jwt'))
export class ScrumController {
  constructor(private readonly scrumService: ScrumService) {}

  // ==================== TASK STATES ====================
  @Get('states')
  getTaskStates() {
    return this.scrumService.getTaskStates();
  }

  @Post('states')
  createTaskState(@Body() dto: CreateTaskStateDto) {
    return this.scrumService.createTaskState(dto);
  }

  // ==================== USERS ====================
  @Get('users')
  getUsers() {
    return this.scrumService.getUsers();
  }

  // ==================== APPLICATIONS ====================
  @Get('applications')
  getApplications(@Request() req) {
    return this.scrumService.getApplications(req.user.id);
  }

  @Get('applications/:id')
  getApplication(@Param('id') id: string, @Request() req) {
    return this.scrumService.getApplication(id, req.user.id);
  }

  @Post('applications')
  createApplication(@Request() req, @Body() dto: CreateApplicationDto) {
    return this.scrumService.createApplication(req.user.id, dto);
  }

  @Patch('applications/:id')
  updateApplication(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.scrumService.updateApplication(id, req.user.id, dto);
  }

  @Delete('applications/:id')
  deleteApplication(@Param('id') id: string, @Request() req) {
    return this.scrumService.deleteApplication(id, req.user.id);
  }

  // ==================== VERSIONS ====================
  @Get('applications/:applicationId/versions')
  getVersions(@Param('applicationId') applicationId: string, @Request() req) {
    return this.scrumService.getVersions(applicationId, req.user.id);
  }

  @Post('versions')
  createVersion(@Request() req, @Body() dto: CreateVersionDto) {
    return this.scrumService.createVersion(req.user.id, dto);
  }

  @Patch('versions/:id')
  updateVersion(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateVersionDto,
  ) {
    return this.scrumService.updateVersion(id, req.user.id, dto);
  }

  @Delete('versions/:id')
  deleteVersion(@Param('id') id: string, @Request() req) {
    return this.scrumService.deleteVersion(id, req.user.id);
  }

  // ==================== PROJECTS ====================
  @Get('versions/:versionId/projects')
  getProjects(@Param('versionId') versionId: string, @Request() req) {
    return this.scrumService.getProjects(versionId, req.user.id);
  }

  @Get('projects/:id')
  getProject(@Param('id') id: string, @Request() req) {
    return this.scrumService.getProject(id, req.user.id);
  }

  @Post('projects')
  createProject(@Request() req, @Body() dto: CreateProjectDto) {
    return this.scrumService.createProject(req.user.id, dto);
  }

  @Patch('projects/:id')
  updateProject(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.scrumService.updateProject(id, req.user.id, dto);
  }

  @Delete('projects/:id')
  deleteProject(@Param('id') id: string, @Request() req) {
    return this.scrumService.deleteProject(id, req.user.id);
  }

  // ==================== ACTIVITIES ====================
  @Get('projects/:projectId/activities')
  getActivitiesByProject(@Param('projectId') projectId: string, @Request() req) {
    return this.scrumService.getActivitiesByProject(projectId, req.user.id);
  }

  @Post('activities')
  createActivity(@Request() req, @Body() dto: CreateActivityDto) {
    return this.scrumService.createActivity(req.user.id, dto);
  }

  @Patch('activities/:id')
  updateActivity(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.scrumService.updateActivity(id, req.user.id, dto);
  }

  @Patch('activities/:id/move')
  moveActivity(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: MoveActivityDto,
  ) {
    return this.scrumService.moveActivity(id, req.user.id, dto);
  }

  @Delete('activities/:id')
  deleteActivity(@Param('id') id: string, @Request() req) {
    return this.scrumService.deleteActivity(id, req.user.id);
  }

  // ==================== SPRINT BACKLOGS ====================
  @Get('projects/:projectId/sprints')
  getSprintBacklogs(@Param('projectId') projectId: string, @Request() req) {
    return this.scrumService.getSprintBacklogs(projectId, req.user.id);
  }

  @Post('sprints')
  createSprintBacklog(@Request() req, @Body() dto: CreateSprintBacklogDto) {
    return this.scrumService.createSprintBacklog(req.user.id, dto);
  }

  @Patch('sprints/:id')
  updateSprintBacklog(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateSprintBacklogDto,
  ) {
    return this.scrumService.updateSprintBacklog(id, req.user.id, dto);
  }

  @Delete('sprints/:id')
  deleteSprintBacklog(@Param('id') id: string, @Request() req) {
    return this.scrumService.deleteSprintBacklog(id, req.user.id);
  }

  @Post('sprints/assign')
  assignActivityToSprint(@Request() req, @Body() dto: AssignActivityToSprintDto) {
    return this.scrumService.assignActivityToSprint(req.user.id, dto);
  }

  @Delete('sprints/assignments/:id')
  removeActivityFromSprint(@Param('id') id: string, @Request() req) {
    return this.scrumService.removeActivityFromSprint(id, req.user.id);
  }

  // ==================== COMMENTS ====================
  @Get('activities/:activityId/comments')
  getComments(@Param('activityId') activityId: string, @Request() req) {
    return this.scrumService.getComments(activityId, req.user.id);
  }

  @Post('comments')
  createComment(@Request() req, @Body() dto: CreateCommentDto) {
    return this.scrumService.createComment(req.user.id, dto);
  }

  @Delete('comments/:id')
  deleteComment(@Param('id') id: string, @Request() req) {
    return this.scrumService.deleteComment(id, req.user.id);
  }
}
