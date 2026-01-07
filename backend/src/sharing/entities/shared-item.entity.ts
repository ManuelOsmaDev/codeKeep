import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SharedRoom } from './shared-room.entity';

@Entity('shared_items')
export class SharedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Room a la que pertenece este item
  @Column()
  roomId: string;

  @ManyToOne(() => SharedRoom, (room) => room.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: SharedRoom;

  // Tipo de item: 'snippet' o 'password'
  @Column()
  itemType: 'snippet' | 'password';

  // ID del snippet o password compartido
  @Column()
  itemId: string;

  // Para passwords: almacena la contraseña desencriptada para compartir
  // Solo se usa cuando itemType === 'password'
  @Column({ nullable: true, type: 'text' })
  sharedPassword: string;

  @CreateDateColumn()
  addedAt: Date;

  @Column({ nullable: true })
  addedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'addedById' })
  addedBy: User;
}
