import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/auth/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: Role.USER, enum: Role })
  role: Role;

  @Prop()
  avatarUrl: string;
  
  @Prop([
    {
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
    },
  ])
  experiences: {
    title: string;
    company: string;
    startDate: Date;
    endDate: Date;
    current: boolean;
  }[];

  @Prop([String])
  skills: string[];

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
