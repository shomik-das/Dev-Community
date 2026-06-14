import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Form } from './entities/form.entity';
import { FormField } from './entities/form-field.entity';
import { FormRecord } from './entities/form-record.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { FormsRepository } from './forms.repository';
import { toSnakeCase } from './helpers/string.helper';
import { validateFieldFormats } from './helpers/validation.helper';

@Injectable()
export class FormsService {
  constructor(
    private readonly formsRepository: FormsRepository,
  ) {}


  // Creates a new Form
  async create(companyId: string, createFormDto: CreateFormDto): Promise<Form> {
    const { title, fields } = createFormDto;

    // 1. Auto-generate field_keys and check for duplicate field_keys
    const fieldKeys = new Set<string>();
    const preparedFields = fields.map((field, idx) => {
      const fieldKey = toSnakeCase(field.label);
      if (fieldKeys.has(fieldKey)) {
        throw new BadRequestException(`Duplicate field key generated from label: "${field.label}" -> "${fieldKey}"`);
      }
      fieldKeys.add(fieldKey);
      return {
        ...field,
        field_key: fieldKey,
        position: field.position !== undefined ? field.position : idx,
      };
    });

    // 2. Perform write inside a transaction
    return await this.formsRepository.getDataSource().transaction(async (manager) => {
      // Save Form
      const form = manager.create(Form, {
        company_id: companyId,
        title,
        total_submission: 0,
      });
      const savedForm = await manager.save(form); 

      // Save FormFields
      const formFields = preparedFields.map((field) => {
        return manager.create(FormField, {
          form_id: savedForm.id,
          company_id: companyId,
          label: field.label,
          field_key: field.field_key,
          field_type: field.field_type,
          is_required: field.is_required ? true : false,
          placeholder: field.placeholder || null,
          position: field.position,
        });
      });
      await manager.save(FormField, formFields);

      // Attach fields to form object to return
      savedForm.fields = formFields;
      return savedForm;
    });
  }

  // Retrieves all forms 
  async findAll(companyId: string): Promise<{ data: Form[] }> {
    const forms = await this.formsRepository.findAllForms(companyId);
    return { data: forms };
  }

  // Retrieves a single form by ID 
  async findOne(companyId: string, formId: string): Promise<Form> {
    const form = await this.formsRepository.findFormById(companyId, formId);

    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found under company ${companyId}`);
    }

    // Fetch and sort fields
    form.fields = await this.formsRepository.findFieldsByFormId(formId);

    return form;
  }

  // Deletes a form and cascades deletion to fields and record
  async remove(companyId: string, formId: string): Promise<{ id: string }> {
    const result = await this.formsRepository.deleteForm(companyId, formId);

    if (result.affected === 0) {
      throw new NotFoundException(`Form with ID ${formId} not found under company ${companyId}`);
    }

    return { id: formId };
  }

  // Submits a form record
  async createRecord(companyId: string, formId: string, createRecordDto: CreateRecordDto): Promise<FormRecord> {
    const form = await this.findOne(companyId, formId);

    // 1. Check for unknown keys
    const allowedKeys = new Set(form.fields.map((f) => f.field_key));
    const unknownKeys = Object.keys(createRecordDto.data).filter((k) => !allowedKeys.has(k));
    if (unknownKeys.length > 0) {
      throw new BadRequestException(`Unknown fields: ${unknownKeys.join(', ')}`);
    }

    // 2. Check for required fields
    const missing = form.fields
      .filter((f) => f.is_required && (createRecordDto.data[f.field_key] === undefined || createRecordDto.data[f.field_key] === null || createRecordDto.data[f.field_key] === ''))
      .map((f) => f.label);
    if (missing.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missing.join(', ')}`);
    }

    // 3. Validate formats per field type
    validateFieldFormats(form.fields, createRecordDto.data);

    // 4. Save record
    return await this.formsRepository.getDataSource().transaction(async (manager) => {
      const record = manager.create(FormRecord, {
        form_id: formId,
        company_id: companyId,
        data: createRecordDto.data,
      });

      const savedRecord = await manager.save(record);
      await manager.increment(Form, { id: formId }, 'total_submission', 1);
      return savedRecord;
    });
  }

  // Retrieves all records along with column headers
  async findAllRecords(companyId: string, formId: string): Promise<{ fields: any[]; data: FormRecord[] }> {
    // Verify form exists
    await this.findOne(companyId, formId);

    const [fields, records] = await Promise.all([
      this.formsRepository.findFieldsByFormId(formId),
      this.formsRepository.findRecordsByFormId(companyId, formId),
    ]);

    const formattedFields = fields.map((f) => ({
      label: f.label,
      field_key: f.field_key,
      field_type: f.field_type,
    }));

    return {
      fields: formattedFields,
      data: records,
    };
  }


  // Updates specific keys inside the record JSON data.
  async updateRecord(companyId: string, formId: string, recordId: string, updateRecordDto: UpdateRecordDto): Promise<FormRecord> {
    const form = await this.findOne(companyId, formId);

    const record = await this.formsRepository.findRecordById(companyId, formId, recordId);

    if (!record) {
      throw new NotFoundException(`Record with ID ${recordId} not found under form ${formId}`);
    }

    // 1. Check for unknown keys
    const allowedKeys = new Set(form.fields.map((f) => f.field_key));
    const unknownKeys = Object.keys(updateRecordDto.data).filter((k) => !allowedKeys.has(k));
    if (unknownKeys.length > 0) {
      throw new BadRequestException(`Unknown fields: ${unknownKeys.join(', ')}`);
    }

    // 2. Validate format for only updated keys
    validateFieldFormats(form.fields, updateRecordDto.data);

    // 3. Merge data keys and save
    record.data = {
      ...record.data,
      ...updateRecordDto.data,
    };

    return await this.formsRepository.saveRecord(record);
  }


  // Deletes a record
  async removeRecord(companyId: string, formId: string, recordId: string): Promise<{ id: string }> {
    await this.formsRepository.getDataSource().transaction(async (manager) => {
      const result = await manager.delete(FormRecord, {
        id: recordId,
        form_id: formId,
        company_id: companyId,
      });

      if (result.affected === 0) {
        throw new NotFoundException(`Record with ID ${recordId} not found under form ${formId}`);
      }

      await manager.decrement(Form, { id: formId }, 'total_submission', 1);
    });

    return { id: recordId };
  }
}
