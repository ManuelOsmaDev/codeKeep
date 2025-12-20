import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { TaskState } from './task-state.entity';
import { SprintBacklogActivity } from './sprint-backlog-activity.entity';

@Entity('scrum_sprint_backlogs')
export class SprintBacklog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.sprintBacklogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFin: Date;

  @Column()
  stateId: string;

  @ManyToOne(() => TaskState, (state) => state.sprintBacklogs)
  @JoinColumn({ name: 'stateId' })
  state: TaskState;

  @OneToMany(() => SprintBacklogActivity, (sba) => sba.sprintBacklog)
  sprintBacklogActivities: SprintBacklogActivity[];
}
