import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Version } from './version.entity';
import { SprintBacklog } from './sprint-backlog.entity';
import { Activity } from './activity.entity';

@Entity('scrum_projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column()
  versionId: string;

  @ManyToOne(() => Version, (version) => version.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'versionId' })
  version: Version;

  @OneToMany(() => SprintBacklog, (sprint) => sprint.project)
  sprintBacklogs: SprintBacklog[];

  @OneToMany(() => Activity, (activity) => activity.project)
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;
}
