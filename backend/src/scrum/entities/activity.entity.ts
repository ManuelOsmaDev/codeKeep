import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { TaskState } from './task-state.entity';
import { User } from '../../users/entities/user.entity';
import { SprintBacklogActivity } from './sprint-backlog-activity.entity';
import { Comment } from './comment.entity';

export type ActivityPriority = 'low' | 'medium' | 'high';

@Entity('scrum_activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descriptor: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  stateId: string;

  @ManyToOne(() => TaskState, (state) => state.activities)
  @JoinColumn({ name: 'stateId' })
  state: TaskState;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 'medium' })
  priority: ActivityPriority;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ default: '#6366f1' })
  color: string;

  @Column({ default: 0 })
  orden: number;

  @OneToMany(() => SprintBacklogActivity, (sba) => sba.activity)
  sprintBacklogActivities: SprintBacklogActivity[];

  @OneToMany(() => Comment, (comment) => comment.activity)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
