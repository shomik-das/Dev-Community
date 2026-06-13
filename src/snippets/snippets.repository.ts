import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Snippet } from './entities/snippet.entity';

@Injectable()
export class SnippetsRepository {
  constructor(
    @InjectRepository(Snippet)
    private readonly snippetModel: Repository<Snippet>,
  ) {}

  /**
   * new Snippet entity
   */
  create(data: Partial<Snippet>): Snippet {
    return this.snippetModel.create(data);
  }

  /**
   * Persists a Snippet entity to the database.
   */
  async save(snippet: Snippet): Promise<Snippet> {
    return await this.snippetModel.save(snippet);
  }

  /**
   * Retrieves all snippets
   */
  async findAll(companyId: string): Promise<Snippet[]> {
    return await this.snippetModel.find({
      where: { company_id: companyId },
      relations: { creator: true, updater: true },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Retrieves a single snippet
   */
  async findOne(companyId: string, snippetId: string): Promise<Snippet | null> {
    return await this.snippetModel.findOne({
      where: { id: snippetId, company_id: companyId },
      select: {
        id: true,
        company_id: true,
        title: true,
        content: true, // Explicitly load the content
        content_preview: true,
        status: true,
        created_by: true,
        updated_by: true,
        created_at: true,
        updated_at: true,
      },
      relations: { creator: true, updater: true },
    });
  }

  /**
   * Finds a snippet with the same title under a company, optionally excluding a specific snippet ID.
   */
  async findDuplicateTitle(companyId: string, title: string, excludeId?: string): Promise<Snippet | null> {
    const whereCondition: any = {
      company_id: companyId,
      title: title,
    };

    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }

    return await this.snippetModel.findOne({
      where: whereCondition,
    });
  }

  /**
   * Deletes a snippet
   */
  async remove(snippet: Snippet): Promise<Snippet> {
    return await this.snippetModel.remove(snippet);
  }
}
