import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('passwords')
export class Password {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  url: string;

  @Column('text')
  encryptedData: string; // JSON cifrado: {title, url, username, password, notes}

  @Column()
  iv: string; // Initialization Vector

  @Column()
  salt: string; // Salt único para esta contraseña

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
