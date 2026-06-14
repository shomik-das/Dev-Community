import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { FormsRepository } from './forms.repository';
import { Form } from './entities/form.entity';
import { FormField } from './entities/form-field.entity';
import { FormRecord } from './entities/form-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Form, FormField, FormRecord])],
  controllers: [FormsController],
  providers: [FormsService, FormsRepository],
  exports: [FormsService, FormsRepository],
})
export class FormsModule {}

