import { BadRequestException } from '@nestjs/common';
import { FormField, FieldType } from '../entities/form-field.entity';

/**
 * Validates format of record data fields against their form field definitions.
 */
export function validateFieldFormats(fields: FormField[], data: Record<string, any>): void {
  for (const field of fields) {
    const value = data[field.field_key];
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (field.field_type === FieldType.EMAIL) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        throw new BadRequestException(`${field.label} must be a valid email`);
      }
    }
    if (field.field_type === FieldType.PHONE) {
      if (!/^\+?[\d\s\-]{7,15}$/.test(String(value))) {
        throw new BadRequestException(`${field.label} must be a valid phone number`);
      }
    }
    if (field.field_type === FieldType.TIME) {
      if (!/^\d{2}:\d{2}$/.test(String(value))) {
        throw new BadRequestException(`${field.label} must be HH:MM format`);
      }
    }
    if (field.field_type === FieldType.NUMBER) {
      if (isNaN(Number(value))) {
        throw new BadRequestException(`${field.label} must be a number`);
      }
    }
  }
}
