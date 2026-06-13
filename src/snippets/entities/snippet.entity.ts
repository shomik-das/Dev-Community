import { Entity,PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

export enum SnippetStatus {
  QUEUED = 'queued',
  SYNCED = 'synced',
  FAILED = 'failed',
}

@Entity('snippets')
@Index(['company_id'])
@Index(['status'])
@Index(['company_id', 'title'], { unique: true })
export class Snippet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.snippets)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', select: false })
  content: string;

  @Column({ length: 150 })
  content_preview: string;

  @Column({
    type: 'enum',
    enum: SnippetStatus,
    default: SnippetStatus.QUEUED,
  })
  status: SnippetStatus;

  @Column()
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column()
  updated_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
