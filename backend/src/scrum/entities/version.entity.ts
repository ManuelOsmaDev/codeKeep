import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Application } from './application.entity';
import { Project } from './project.entity';

@Entity('scrum_versiones')
export class Version {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column()
  applicationId: string;

  @ManyToOne(() => Application, (app) => app.versiones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @OneToMany(() => Project, (project) => project.version)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;
}
