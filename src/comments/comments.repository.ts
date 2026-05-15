import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  /** Creates a new comment. */
  async create(createCommentDto: CreateCommentDto, userId: string): Promise<CommentDocument> {
    const { postId, content } = createCommentDto;
    const newComment = new this.commentModel({
      content,
      author: userId,
      post: postId,
    });
    return await newComment.save();
  }

  /** Retrieves all comments for a specific post. */
  async findByPost(postId: string): Promise<Comment[]> {
    return await this.commentModel.aggregate([
      {
        $match: { post: new Types.ObjectId(postId) },
      },
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
      {
        $project: {
          _id: 1,
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

  /** Finds a comment by ID. */
  async findById(id: string): Promise<CommentDocument | null> {
    return await this.commentModel.findById(id);
  }

  /** Updates an existing comment. */
  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<CommentDocument | null> {
    return await this.commentModel.findByIdAndUpdate(id, updateCommentDto, { new: true }).exec();
  }

  /** Removes a comment. */
  async remove(id: string): Promise<void> {
    await this.commentModel.findByIdAndDelete(id).exec();
  }
}
