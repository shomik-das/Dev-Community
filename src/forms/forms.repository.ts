import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeleteResult } from 'typeorm';
import { Form } from './entities/form.entity';
import { FormField } from './entities/form-field.entity';
import { FormRecord } from './entities/form-record.entity';

@Injectable()
export class FormsRepository {
  constructor(
    @InjectRepository(Form)
    private readonly formModel: Repository<Form>,
    @InjectRepository(FormField)
    private readonly fieldModel: Repository<FormField>,
    @InjectRepository(FormRecord)
    private readonly recordModel: Repository<FormRecord>,
    private readonly dataSource: DataSource,
  ) {}

  getDataSource(): DataSource {
    return this.dataSource;
  }

  // --- Form ---
  createForm(data: Partial<Form>): Form {
    return this.formModel.create(data);
  }

  async saveForm(form: Form): Promise<Form> {
    return await this.formModel.save(form);
  }

  async findAllForms(companyId: string): Promise<Form[]> {
    return await this.formModel.find({
      where: { company_id: companyId },
      order: { updated_at: 'DESC' },
    });
  }

  async findFormById(companyId: string, formId: string): Promise<Form | null> {
    return await this.formModel.findOne({
      where: { id: formId, company_id: companyId },
    });
  }

  async deleteForm(companyId: string, formId: string): Promise<DeleteResult> {
    return await this.formModel.delete({
      id: formId,
      company_id: companyId,
    });
  }

  // --- FormField ---
  createField(data: Partial<FormField>): FormField {
    return this.fieldModel.create(data);
  }

  async saveFields(fields: FormField[]): Promise<FormField[]> {
    return await this.fieldModel.save(fields);
  }

  async findFieldsByFormId(formId: string): Promise<FormField[]> {
    return await this.fieldModel.find({
      where: { form_id: formId },
      order: { position: 'ASC' },
    });
  }

  // --- FormRecord ---
  createRecord(data: Partial<FormRecord>): FormRecord {
    return this.recordModel.create(data);
  }

  async saveRecord(record: FormRecord): Promise<FormRecord> {
    return await this.recordModel.save(record);
  }

  async findRecordById(companyId: string, formId: string, recordId: string): Promise<FormRecord | null> {
    return await this.recordModel.findOne({
      where: { id: recordId, form_id: formId, company_id: companyId },
    });
  }

  async findRecordsByFormId(companyId: string, formId: string): Promise<FormRecord[]> {
    return await this.recordModel.find({
      where: { form_id: formId, company_id: companyId },
      order: { created_at: 'DESC' },
    });
  }
}
