import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Role } from 'src/auth/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.userModel.create({
        ...createUserDto,
        role: Role.USER,
      });
      return newUser;
    } catch (error) {
      const DUPLICATE_KEY_ERROR = 11000;
      if (error.code === DUPLICATE_KEY_ERROR) {
        const fieldName = Object.keys(error.keyValue)[0];
        this.logger.error(`Signup failed: Invalid credentials for email: ${createUserDto.email}`);
        throw new ConflictException(
          `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists`,
        );
      }
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findUserById(id: string) {
    return await this.userModel.findById(id).select('-password');
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    return await this.userModel
      .findByIdAndUpdate(id, updateProfileDto, {
        new: true,
      })
      .select('-password');
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    await this.userModel.findByIdAndUpdate(id, { refreshToken });
  }

  async addSkill(id: string, skill: string) {
    return await this.userModel
      .findByIdAndUpdate(id, { $addToSet: { skills: skill } }, { new: true })
      .select('-password');
  }

  async removeSkill(id: string, skill: string) {
    return await this.userModel
      .findByIdAndUpdate(id, { $pull: { skills: skill } }, { new: true })
      .select('-password');
  }

  async addExperience(id: string, experience: any) {
    return await this.userModel
      .findByIdAndUpdate(
        id,
        { $push: { experiences: experience } },
        { new: true },
      )
      .select('-password');
  }

  async updateExperience(userId: string, expId: string, experience: any) {
    const updateFields = {};
    Object.keys(experience).forEach((key) => {
      updateFields[`experiences.$.${key}`] = experience[key];
    });

    return await this.userModel
      .findOneAndUpdate(
        { _id: userId, 'experiences._id': expId },
        { $set: updateFields },
        { new: true },
      )
      .select('-password');
  }

  async removeExperience(userId: string, expId: string) {
    return await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { experiences: { _id: expId } } },
        { new: true },
      )
      .select('-password');
  }
}
