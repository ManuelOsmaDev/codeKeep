import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ResourceType } from './scrum-member.entity';

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

@Entity('scrum_invitations')
export class ScrumInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  resourceType: ResourceType; // 'application', 'version', or 'project'

  @Column()
  resourceId: string; // ID of the application, version, or project

  @Column({ nullable: true })
  resourceName: string; // Name for display purposes

  @Column({ default: 'pending' })
  status: InvitationStatus;

  @Column({ unique: true })
  token: string;

  @Column()
  invitedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitedById' })
  invitedBy: User;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
