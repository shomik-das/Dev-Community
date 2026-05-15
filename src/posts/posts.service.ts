import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Comment, CommentDocument } from 'src/comments/schemas/comment.schema';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /** Creates a new post. */
  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    return await this.postsRepository.create(createPostDto, userId);
  }

  /** Retrieves all posts with author information and comment counts. */
  async findAll(): Promise<Post[]> {
    return await this.postsRepository.findAll();
  }

  /** Retrieves a single post by its ID, including author and comments. */
  async findOne(id: string): Promise<Post> {
    const result = await this.postsRepository.findOne(id);

    if (!result.length) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return result[0];
  }

  /** Updates an existing post. */
  async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Ownership check — only the author can update
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return (await this.postsRepository.update(id, updatePostDto)) as Post;
  }

  /** Removes a post and all its associated comments. */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Ownership check
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1: Delete the post
      await this.postsRepository.delete(id, session);

      // 2: Delete all comments associated with this post
      await this.commentModel.deleteMany({ post: id } as any).session(session);

      await session.commitTransaction();
      return { message: 'Post and associated comments deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
