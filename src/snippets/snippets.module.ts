import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnippetsService } from './snippets.service';
import { SnippetsController } from './snippets.controller';
import { Snippet } from './entities/snippet.entity';
import { Company } from './entities/company.entity';
import { User } from './entities/user.entity';

import { SnippetsRepository } from './snippets.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Snippet, Company, User])],
  controllers: [SnippetsController],
  providers: [SnippetsService, SnippetsRepository],
  exports: [SnippetsService, SnippetsRepository],
})
export class SnippetsModule {}

