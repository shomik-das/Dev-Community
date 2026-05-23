import { Injectable, ConflictException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types, ClientSession } from 'mongoose'
import { Like, LikeDocument } from './schemas/like.schema'
import { Post, PostDocument } from 'src/posts/schemas/post.schema'

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) { }

  /** Adds a like to a post and increments the post's stored likeCount atomically. */
  async addLike(postId: string, userId: string): Promise<LikeDocument> {
    const session: ClientSession = await this.likeModel.db.startSession()
    session.startTransaction()
    try {
      const like = await new this.likeModel(
        { post: new Types.ObjectId(postId), user: new Types.ObjectId(userId) },
      ).save({ session })
      await this.postModel.updateOne(
        { _id: new Types.ObjectId(postId) },
        { $inc: { likeCount: 1 } },
        { session },
      )
      await session.commitTransaction()
      return like
    } catch (err) {
      await session.abortTransaction()
      // Mongo duplicate key error code
      if (err?.code === 11000) {
        throw new ConflictException('You have already liked this post')
      }
      throw err
    } finally {
      await session.endSession()
    }
  }

  /** Removes a like from a post and decrements the post's stored likeCount atomically. */
  async removeLike(postId: string, userId: string): Promise<void> {
    const session: ClientSession = await this.likeModel.db.startSession()
    session.startTransaction()
    try {
      const deleted = await this.likeModel
        .findOneAndDelete({ post: postId, user: userId } as any)
        .session(session)
      if (!deleted) {
        throw new BadRequestException('You have not liked this post')
      }
      await this.postModel.updateOne(
        { _id: new Types.ObjectId(postId) },
        { $inc: { likeCount: -1 } },
        { session },
      )
      await session.commitTransaction()
    } catch (err) {
      await session.abortTransaction()
      throw err
    } finally {
      await session.endSession()
    }
  }
}
