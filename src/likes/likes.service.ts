import { Injectable } from '@nestjs/common'
import { LikeDto } from './dto/like.dto'
import { LikesRepository } from './likes.repository'

@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: LikesRepository) { }

  /** Adds a like to a post. */
  async addLike(likeDto: LikeDto, userId: string) {
    return await this.likesRepository.addLike(likeDto.postId, userId)
  }

  /** Removes a like from a post. */
  async removeLike(likeDto: LikeDto, userId: string) {
    return await this.likesRepository.removeLike(likeDto.postId, userId)
  }
}
