import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { SharedRoom } from './shared-room.entity';

@Entity('room_access_list')
export class RoomAccessList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roomId: string;

  @ManyToOne(() => SharedRoom, (room) => room.accessList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: SharedRoom;

  @Column()
  userEmail: string;

  @Column({ default: false })
  canCreate: boolean;

  @Column({ default: false })
  canUpdate: boolean;

  @Column({ default: false })
  canDelete: boolean;

  @Column({ default: false })
  canShare: boolean;

  @Column({ default: false })
  canViewPasswords: boolean;

  @CreateDateColumn()
  grantedAt: Date;
}
