import { Controller, Post, Delete, Body, Request, UseGuards } from '@nestjs/common'
import { LikesService } from './likes.service'
import { LikeDto } from './dto/like.dto'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) { }

  @Post('add')
  async addLike(@Body() likeDto: LikeDto, @Request() req) {
    return await this.likesService.addLike(likeDto, req.user.id)
  }

  @Delete('remove')
  async removeLike(@Body() likeDto: LikeDto, @Request() req) {
    return await this.likesService.removeLike(likeDto, req.user.id)
  }
}
