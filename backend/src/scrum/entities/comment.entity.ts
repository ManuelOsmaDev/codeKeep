import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Activity } from './activity.entity';
import { User } from '../../users/entities/user.entity';
import { SprintBacklog } from './sprint-backlog.entity';

@Entity('scrum_comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ nullable: true })
  activityId: string;

  @ManyToOne(() => Activity, (activity) => activity.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({ nullable: true })
  sprintId: string;

  @ManyToOne(() => SprintBacklog, (sprint) => sprint.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'sprintId' })
  sprint: SprintBacklog;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
