import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateExperienceDto, ExperienceDto } from './dto/update-experience.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userRepository: UserRepository) {}

  /** Creates a new user in the database. */
  async createUser(createUserDto: CreateUserDto) {
    try {
      return await this.userRepository.create(createUserDto);
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

  /** Finds a user by their email address. */
  async findUserByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  /** Finds a user by their ID, excluding the password field. */
  async findUserById(id: string) {
    return await this.userRepository.findById(id);
  }

  /** Updates a user's profile information. */
  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    return await this.userRepository.updateProfile(id, updateProfileDto);
  }

  /** Updates a user's refresh token. */
  async updateRefreshToken(id: string, refreshToken: string | null) {
    await this.userRepository.updateRefreshToken(id, refreshToken);
  }

  /** Adds a skill to a user's skill set. */
  async addSkill(id: string, skill: string) {
    return await this.userRepository.addSkill(id, skill);
  }

  /** Removes a skill from a user's skill set. */
  async removeSkill(id: string, skill: string) {
    return await this.userRepository.removeSkill(id, skill);
  }

  /** Adds a new experience entry to a user's profile. */
  async addExperience(id: string, experience: ExperienceDto) {
    return await this.userRepository.addExperience(id, experience);
  }

  /** Updates an existing experience entry for a user. */
  async updateExperience(
    userId: string,
    expId: string,
    updateExperienceDto: UpdateExperienceDto,
  ) {
    return await this.userRepository.updateExperience(userId, expId, updateExperienceDto);
  }

  /** Removes an experience entry from a user's profile. */
  async removeExperience(userId: string, expId: string) {
    return await this.userRepository.removeExperience(userId, expId);
  }
}
