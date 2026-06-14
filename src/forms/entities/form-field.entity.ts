import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Form } from './form.entity';

export enum FieldType {
  TEXT     = 'text',
  NUMBER   = 'number',
  EMAIL    = 'email',
  PHONE    = 'phone',
  TIME     = 'time',
  DATE     = 'date',
  URL      = 'url',
  TEXTAREA = 'textarea',
}

@Entity('form_fields')
@Unique(['form_id', 'field_key'])
export class FormField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  form_id: string;

  @Column({ type: 'varchar', length: 30 })
  company_id: string;

  @Column({ type: 'varchar', length: 100 })
  label: string;

  @Column({ type: 'varchar', length: 100 })
  field_key: string;

  @Column({ type: 'enum', enum: FieldType, default: FieldType.TEXT })
  field_type: FieldType;

  @Column({ type: 'tinyint', default: 0 })
  is_required: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  placeholder: string | null;

  @Column({ type: 'smallint', default: 0 })
  position: number;

  @ManyToOne(() => Form, (form) => form.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: Form;
}
