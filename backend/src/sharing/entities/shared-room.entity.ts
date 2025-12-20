import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SharedItem } from './shared-item.entity';
import { RoomAccessList } from './room-access-list.entity';

@Entity('shared_rooms')
export class SharedRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nombre de la room
  @Column()
  name: string;

  // Descripción opcional
  @Column({ type: 'text', nullable: true })
  description: string;

  // Usuario propietario
  @Column()
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // Token único para compartir
  @Column({ unique: true })
  shareToken: string;

  // Si la room está activa
  @Column({ default: true })
  isActive: boolean;

  // Contador de vistas
  @Column({ default: 0 })
  viewCount: number;

  // Si la room es pública (true) o privada con whitelist (false)
  @Column({ default: true })
  isPublic: boolean;

  // Lista de emails autorizados para rooms privadas
  @OneToMany(() => RoomAccessList, (access) => access.room)
  accessList: RoomAccessList[];

  // Items en esta room
  @OneToMany(() => SharedItem, (item) => item.room)
  items: SharedItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
