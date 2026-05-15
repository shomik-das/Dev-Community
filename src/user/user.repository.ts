import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateExperienceDto, ExperienceDto } from './dto/update-experience.dto';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /** Creates a new user. */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return await this.userModel.create({
      ...createUserDto,
      role: Role.USER,
    });
  }

  /** Finds a user by email. */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email });
  }

  /** Finds a user by ID. */
  async findById(id: string): Promise<UserDocument | null> {
    return await this.userModel.findById(id).select('-password');
  }

  /** Updates user profile. */
  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument | null> {
    return await this.userModel
      .findByIdAndUpdate(id, updateProfileDto, { new: true })
      .select('-password');
  }

  /** Updates refresh token. */
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken });
  }

  /** Adds a skill. */
  async addSkill(id: string, skill: string): Promise<UserDocument | null> {
    return await this.userModel
      .findByIdAndUpdate(id, { $addToSet: { skills: skill } }, { new: true })
      .select('-password');
  }

  /** Removes a skill. */
  async removeSkill(id: string, skill: string): Promise<UserDocument | null> {
    return await this.userModel
      .findByIdAndUpdate(id, { $pull: { skills: skill } }, { new: true })
      .select('-password');
  }

  /** Adds experience. */
  async addExperience(id: string, experience: ExperienceDto): Promise<UserDocument | null> {
    return await this.userModel
      .findByIdAndUpdate(id, { $push: { experiences: experience } }, { new: true })
      .select('-password');
  }

  /** Updates experience. */
  async updateExperience(
    userId: string,
    expId: string,
    updateExperienceDto: UpdateExperienceDto,
  ): Promise<UserDocument | null> {
    const updateFields = {};
    Object.keys(updateExperienceDto).forEach((key) => {
      updateFields[`experiences.$.${key}`] = updateExperienceDto[key];
    });

    return await this.userModel
      .findOneAndUpdate(
        { _id: userId, 'experiences._id': expId },
        { $set: updateFields },
        { new: true },
      )
      .select('-password');
  }

  /** Removes experience. */
  async removeExperience(userId: string, expId: string): Promise<UserDocument | null> {
    return await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { experiences: { _id: expId } } },
        { new: true },
      )
      .select('-password');
  }
}
