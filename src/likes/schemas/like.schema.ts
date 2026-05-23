import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { User } from 'src/user/schemas/user.schema'
import { Post } from 'src/posts/schemas/post.schema'

export type LikeDocument = Like & Document

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  post: Post
}

export const LikeSchema = SchemaFactory.createForClass(Like)

// Prevent a user from liking the same post twice at the DB level
LikeSchema.index({ user: 1, post: 1 }, { unique: true })
