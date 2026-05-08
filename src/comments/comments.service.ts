import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private postsService: PostsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const { postId, content } = createCommentDto;

    // Verify post exists before creating comment
    await this.postsService.findOne(postId);

    const newComment = new this.commentModel({
      content,
      author: userId,
      post: postId,
    });

    return await newComment.save();
  }

  // Get all comments for a specific post
  async findByPost(postId: string): Promise<Comment[]> {
    return await this.commentModel.aggregate([
      // 1: Only comments belonging to this post
      {
        $match: { post: new Types.ObjectId(postId) },
      },
      // 2: Join with users to get author info
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $unwind: '$author',
      },
      // 3: Shape output — never expose password or refreshToken
      {
        $project: {
          content: 1,
          createdAt: 1,
          'author._id': 1,
          'author.name': 1,
          'author.email': 1,
          'author.avatarUrl': 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Ownership check
    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return (await this.commentModel.findByIdAndUpdate(id, updateCommentDto, { new: true }).exec()) as Comment;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Ownership check
    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentModel.findByIdAndDelete(id).exec();
    return { message: 'Comment deleted successfully' };
  }
}
