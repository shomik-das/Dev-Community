import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Post, PostDocument } from 'src/posts/schemas/post.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) { }

  /** Creates a new comment or reply and increments counts atomically. */
  async create(createCommentDto: CreateCommentDto, userId: string): Promise<CommentDocument> {
    const { postId, content, parentId } = createCommentDto;
    const session: ClientSession = await this.commentModel.db.startSession()
    session.startTransaction()
    try {
      if (parentId) {
        const parentComment = await this.commentModel.findById(parentId).session(session)
        if (!parentComment) {
          throw new BadRequestException('Parent comment does not exist')
        }
      }

      const comment = await new this.commentModel({
        content,
        author: userId,
        post: postId,
        parent: parentId || null,
      }).save({ session })

      if (parentId) {
        await this.commentModel.updateOne(
          { _id: new Types.ObjectId(parentId) },
          { $inc: { replyCount: 1 } },
          { session },
        )
      }

      await this.postModel.updateOne(
        { _id: new Types.ObjectId(postId) },
        { $inc: { commentCount: 1 } },
        { session },
      )
      await session.commitTransaction()
      return comment
    } catch (err) {
      await session.abortTransaction()
      throw err instanceof BadRequestException ? err : new InternalServerErrorException(err)
    } finally {
      await session.endSession()
    }
  }

  /** Retrieves all top-level comments for a specific post. */
  async findByPost(postId: string): Promise<Comment[]> {
    return await this.commentModel.aggregate([
      {
        $match: {
          post: new Types.ObjectId(postId),
          parent: null,
        },
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
          replyCount: 1,
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

  /** Retrieves all replies for a parent comment. */
  async findReplies(parentId: string): Promise<Comment[]> {
    return await this.commentModel.aggregate([
      {
        $match: {
          parent: new Types.ObjectId(parentId),
        },
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
          replyCount: 1,
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
