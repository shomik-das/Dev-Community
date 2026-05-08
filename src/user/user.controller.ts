import { Controller, Get, Patch, Post, Delete, Body, Request, UseGuards, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateExperienceDto, ExperienceDto } from './dto/update-experience.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return await this.userService.findUserById(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return await this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('skills')
  async addSkill(@Request() req, @Body('skill') skill: string) {
    return await this.userService.addSkill(req.user.id, skill);
  }

  @Delete('skills')
  async removeSkill(@Request() req, @Body('skill') skill: string) {
    return await this.userService.removeSkill(req.user.id, skill);
  }

  @Post('experiences')
  async addExperience(@Request() req, @Body() experience: ExperienceDto) {
    return await this.userService.addExperience(req.user.id, experience);
  }

  @Patch('experiences/:expId')
  async updateExperience(@Request() req, @Param('expId') expId: string, @Body() updateExperienceDto: UpdateExperienceDto,) {
    return await this.userService.updateExperience(req.user.id, expId, updateExperienceDto);
  }

  @Delete('experiences/:expId')
  async removeExperience(@Request() req, @Param('expId') expId: string) {
    return await this.userService.removeExperience(req.user.id, expId);
  }
}
