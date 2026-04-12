import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { SignUpDto } from 'src/auth/dto/signUp.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(signUpDto: SignUpDto) {
    try{
        const newUser = await this.userModel.create({
            name: signUpDto.name,
            email: signUpDto.email,
            password: signUpDto.password,
            role: 'USER',
        });
        return newUser;
    } 
    catch (error) {
      const DUPLICATE_KEY_ERROR = 11000;
      if (error.code === DUPLICATE_KEY_ERROR) {
        const fieldName = Object.keys(error.keyValue)[0];
        throw new ConflictException(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists`);
      }
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findUserById(id: string) {
    return await this.userModel.findById(id).select('-password');
  }
}