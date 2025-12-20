import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Activity } from './activity.entity';
import { SprintBacklog } from './sprint-backlog.entity';

@Entity('scrum_sprint_backlog_activities')
export class SprintBacklogActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  activityId: string;

  @ManyToOne(() => Activity, (activity) => activity.sprintBacklogActivities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column()
  sprintBacklogId: string;

  @ManyToOne(() => SprintBacklog, (sprint) => sprint.sprintBacklogActivities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sprintBacklogId' })
  sprintBacklog: SprintBacklog;

  @CreateDateColumn()
  createdAt: Date;
}
