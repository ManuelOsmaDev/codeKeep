import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { SprintBacklog } from './sprint-backlog.entity';
import { Activity } from './activity.entity';

@Entity('scrum_task_states')
export class TaskState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ default: 0 })
  orden: number;

  @Column({ default: '#6366f1' })
  color: string;

  @OneToMany(() => SprintBacklog, (sprint) => sprint.state)
  sprintBacklogs: SprintBacklog[];

  @OneToMany(() => Activity, (activity) => activity.state)
  activities: Activity[];
}
