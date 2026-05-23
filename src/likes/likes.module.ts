import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LikesService } from './likes.service'
import { LikesController } from './likes.controller'
import { LikesRepository } from './likes.repository'
import { Like, LikeSchema } from './schemas/like.schema'
import { PostsModule } from 'src/posts/posts.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    PostsModule,
  ],
  controllers: [LikesController],
  providers: [LikesService, LikesRepository],
  exports: [LikesService, LikesRepository],
})
export class LikesModule { }
