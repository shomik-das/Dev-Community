import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('companies/:companyId/snippets')
@UseGuards(JwtAuthGuard)
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Post()
  create(@Request() req,@Param('companyId') companyId: string,@Body() createSnippetDto: CreateSnippetDto,) {
    return this.snippetsService.create(companyId, createSnippetDto, req.user.id);
  }

  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.snippetsService.findAll(companyId);
  }

  @Get(':snippetId')
  findOne(@Param('companyId') companyId: string, @Param('snippetId') snippetId: string) {
    return this.snippetsService.findOne(companyId, snippetId);
  }

  @Patch(':snippetId')
  update(@Request() req,@Param('companyId') companyId: string,@Param('snippetId') snippetId: string,@Body() updateSnippetDto: UpdateSnippetDto,) {
    return this.snippetsService.update(companyId, snippetId, updateSnippetDto, req.user.id);
  }

  @Delete(':snippetId')
  remove(@Param('companyId') companyId: string, @Param('snippetId') snippetId: string) {
    return this.snippetsService.remove(companyId, snippetId);
  }
}

