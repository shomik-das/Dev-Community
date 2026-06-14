import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { Snippet, SnippetStatus } from './entities/snippet.entity';
import { sanitizeHtml, stripHtml } from './helpers/html-sanitizer';
import { SnippetsRepository } from './snippets.repository';

@Injectable()
export class SnippetsService {
  constructor(
    private readonly snippetsRepository: SnippetsRepository,
  ) {}


  // Creates a new snippet
  async create(companyId: string, createSnippetDto: CreateSnippetDto, userId: string): Promise<Snippet> {
    const { title, content } = createSnippetDto;

    // 1. Trim title
    const trimmedTitle = title.trim();

    // 2. Sanitize HTML
    const sanitizedContent = sanitizeHtml(content);

    if (!sanitizedContent || stripHtml(sanitizedContent).length === 0) {
      throw new BadRequestException('Snippet content cannot be empty or contain only unsafe tags');
    }

    // 4. check duplicate title in the same company
    const duplicate = await this.snippetsRepository.findDuplicateTitle(companyId, trimmedTitle);
    if (duplicate) {
      throw new ConflictException(`Snippet with title "${trimmedTitle}" already exists for this company`);
    }

    // Generate content preview: first 120 chars of stripped plain text
    const plainText = stripHtml(sanitizedContent);
    const contentPreview = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;

    // Create snippet record
    const snippet = this.snippetsRepository.create({
      company_id: companyId,
      title: trimmedTitle,
      content: sanitizedContent,
      content_preview: contentPreview,
      status: SnippetStatus.QUEUED,
      created_by: userId,
      updated_by: userId,
    });

    return await this.snippetsRepository.save(snippet);
  }

  // Retrieves all snippets
  async findAll(companyId: string): Promise<Snippet[]> {
    return await this.snippetsRepository.findAll(companyId);
  }

  /**
   * Retrieves a single snippet by ID within a specific company.
   */
  async findOne(companyId: string, snippetId: string): Promise<Snippet> {
    const snippet = await this.snippetsRepository.findOne(companyId, snippetId);

    if (!snippet) {
      throw new NotFoundException(`Snippet with ID ${snippetId} not found under company ${companyId}`);
    }

    return snippet;
  }

  // Updates a snippet according to the detailed patch specifications.
  async update(companyId: string, snippetId: string, updateSnippetDto: UpdateSnippetDto, userId: string): Promise<Snippet> {
    // 1. Validate at least one field exists
    if (Object.keys(updateSnippetDto).length === 0) {
      throw new BadRequestException('Request body must contain at least one field to update');
    }

    const { title, content, status } = updateSnippetDto;

    // 2. Fetch existing snippet
    const snippet = await this.findOne(companyId, snippetId);

    // 3. If title is provided, validate uniqueness
    if (title !== undefined) {
      const trimmedTitle = title.trim();
      const duplicate = await this.snippetsRepository.findDuplicateTitle(companyId, trimmedTitle, snippetId);
      if (duplicate) {
        throw new ConflictException(`Snippet with title "${trimmedTitle}" already exists for this company`);
      }
      snippet.title = trimmedTitle;
    }

    // 4. If content is provided, sanitize and rebuild preview and set status back to queued
    if (content !== undefined) {
      const sanitizedContent = sanitizeHtml(content);
      if (!sanitizedContent || stripHtml(sanitizedContent).length === 0) {
        throw new BadRequestException('Snippet content cannot be empty');
      }
      const plainText = stripHtml(sanitizedContent);
      const contentPreview = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;

      snippet.content = sanitizedContent;
      snippet.content_preview = contentPreview;
      snippet.status = SnippetStatus.QUEUED;
    }

    // 5. If status is provided
    if (status !== undefined) {
      snippet.status = status;
    }

    // 6. Update the last update
    snippet.updated_by = userId;

    return await this.snippetsRepository.save(snippet);
  }

  /**
   * Deletes a snippet and returns the deleted snippet's ID
   */
  async remove(companyId: string, snippetId: string): Promise<{ id: string }> {
    const snippet = await this.findOne(companyId, snippetId);
    await this.snippetsRepository.remove(snippet);
    return { id: snippetId };
  }
}
