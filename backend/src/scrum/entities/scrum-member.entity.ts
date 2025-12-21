import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type MemberRole = 'owner' | 'admin' | 'member';
export type ResourceType = 'application' | 'version' | 'project';

@Entity('scrum_members')
@Unique(['userId', 'resourceType', 'resourceId'])
export class ScrumMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  resourceType: ResourceType; // 'application', 'version', or 'project'

  @Column()
  resourceId: string; // ID of the application, version, or project

  @Column({ default: 'member' })
  role: MemberRole;

  @CreateDateColumn()
  joinedAt: Date;
}
