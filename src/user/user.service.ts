import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { SignUpDto } from 'src/auth/dto/signUp.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(signUpDto: SignUpDto) {
    const newUser = new this.userModel({
      name: signUpDto.name,
      email: signUpDto.email,
      password: signUpDto.password,
    });
    return await newUser.save();
  }
}