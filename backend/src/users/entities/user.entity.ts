import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Snippet } from '../../snippets/entities/snippet.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: '👨‍💻' })
  avatar: string;

  @Column({ default: 'dark' })
  theme: string;

  @Column({ default: true })
  notifications: boolean;

  @Column({ default: false })
  compactMode: boolean;

  @Column({ default: 'javascript' })
  defaultLanguage: string;

  @Column({ default: true })
  lineNumbers: boolean;

  @Column({ default: true })
  autoSave: boolean;

  @Column({ default: false })
  emailNotifications: boolean;

  // Permissions
  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  canManagePasswords: boolean;

  @Column({ default: false })
  canManageSnippets: boolean;

  // Google OAuth fields
  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ nullable: true, type: 'text' })
  googleAccessToken: string;

  @Column({ nullable: true, type: 'text' })
  googleRefreshToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  googleTokenExpiry: Date;

  // Password Manager fields
  @Column({ nullable: true })
  @Exclude()
  masterPasswordHash: string; // Hash de la clave maestra para verificación

  @Column({ nullable: true })
  @Exclude()
  masterPasswordSalt: string; // Salt único para la clave maestra del usuario


  @OneToMany(() => Snippet, (snippet) => snippet.user)
  snippets: Snippet[];

  @ManyToMany(() => Snippet)
  @JoinTable({
    name: 'user_favorites',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'snippet_id', referencedColumnName: 'id' },
  })
  favorites: Snippet[];

  @ManyToMany(() => Snippet)
  @JoinTable({
    name: 'user_bookmarks',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'snippet_id', referencedColumnName: 'id' },
  })
  bookmarks: Snippet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
