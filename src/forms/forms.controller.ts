import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('companies/:companyId/forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@Param('companyId') companyId: string, @Body() createFormDto: CreateFormDto) {
    return this.formsService.create(companyId, createFormDto);
  }

  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.formsService.findAll(companyId);
  }

  @Get(':formId')
  findOne(@Param('companyId') companyId: string, @Param('formId') formId: string) {
    return this.formsService.findOne(companyId, formId);
  }

  @Patch(':formId')
  update(@Param('companyId') companyId: string, @Param('formId') formId: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.update(companyId, formId, updateFormDto);
  }


  @Delete(':formId')
  remove(@Param('companyId') companyId: string, @Param('formId') formId: string) {
    return this.formsService.remove(companyId, formId);
  }

  @Post(':formId/records')
  createRecord(@Param('companyId') companyId: string, @Param('formId') formId: string, @Body() createRecordDto: CreateRecordDto) {
    return this.formsService.createRecord(companyId, formId, createRecordDto);
  }

  @Get(':formId/records')
  findAllRecords(@Param('companyId') companyId: string, @Param('formId') formId: string) {
    return this.formsService.findAllRecords(companyId, formId);
  }

  @Patch(':formId/records/:recordId')
  updateRecord(@Param('companyId') companyId: string, @Param('formId') formId: string, @Param('recordId') recordId: string, @Body() updateRecordDto: UpdateRecordDto) {
    return this.formsService.updateRecord(companyId, formId, recordId, updateRecordDto);
  }

  @Delete(':formId/records/:recordId')
  removeRecord(@Param('companyId') companyId: string, @Param('formId') formId: string, @Param('recordId') recordId: string) {
    return this.formsService.removeRecord(companyId, formId, recordId);
  }
}
