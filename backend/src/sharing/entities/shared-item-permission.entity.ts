import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { SharedItem } from './shared-item.entity';

@Entity('shared_item_permissions')
export class SharedItemPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SharedItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_item_id' })
  sharedItem: SharedItem;

  @Column({ name: 'shared_item_id' })
  sharedItemId: string;

  @Column({ name: 'user_email' })
  userEmail: string;

  @Column({ name: 'can_view', default: true })
  canView: boolean;

  @Column({ name: 'can_edit', default: false })
  canEdit: boolean;

  @CreateDateColumn({ name: 'granted_at' })
  grantedAt: Date;
}
