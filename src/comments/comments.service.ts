import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './schemas/comment.schema';
import { PostsService } from 'src/posts/posts.service';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private postsService: PostsService,
  ) {}

  /** Creates a new comment on a post. */
  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const { postId } = createCommentDto;

    // Verify post exists before creating comment
    await this.postsService.findOne(postId);

    return await this.commentsRepository.create(createCommentDto, userId);
  }

  /** Retrieves all comments for a specific post. */
  async findByPost(postId: string): Promise<Comment[]> {
    return await this.commentsRepository.findByPost(postId);
  }

  /** Retrieves all replies for a parent comment. */
  async findReplies(parentId: string): Promise<Comment[]> {
    const parentComment = await this.commentsRepository.findById(parentId);
    if (!parentComment) {
      throw new NotFoundException(`Parent comment with ID ${parentId} not found`);
    }
    return await this.commentsRepository.findReplies(parentId);
  }

  /** Updates an existing comment. */
  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Ownership check
    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return (await this.commentsRepository.update(id, updateCommentDto)) as Comment;
  }

  /** Removes a comment. */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Ownership check
    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(id);
    return { message: 'Comment deleted successfully' };
  }
}
