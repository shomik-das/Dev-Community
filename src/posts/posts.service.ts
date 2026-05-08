import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const newPost = new this.postModel({...createPostDto, author: userId});
    return await newPost.save();
  }

  async findAll(): Promise<Post[]> {
    return await this.postModel.aggregate([
      // 1: Join with users collection to get author details
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      // 2: Flatten author array into a single object
      {
        $unwind: '$author',
      },
      // 3: Join with comments collection to get comment count
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments',
        },
      },
      // 4: Shape the final output — hide sensitive fields
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          'author._id': 1,
          'author.name': 1,
          'author.email': 1,
          'author.avatarUrl': 1,
          commentCount: { $size: '$comments' },
        },
      },
      // 5: Newest first
      {
        $sort: { createdAt: -1 },
      },
    ]);
  }

  async findOne(id: string): Promise<Post> {
    const result = await this.postModel.aggregate([
      // 1: Match only the post we want
      {
        $match: { _id: new Types.ObjectId(id) },
      },
      // 2: Join author
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $unwind: '$author',
      },
      // 3: Join comments with their authors nested inside
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
              },
            },
            { $unwind: '$author' },
            {
              $project: {
                content: 1,
                createdAt: 1,
                'author._id': 1,
                'author.name': 1,
                'author.avatarUrl': 1,
              },
            },
            { $sort: { createdAt: -1 } },
          ],
          as: 'comments',
        },
      },
      // 4: Shape output
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          'author._id': 1,
          'author.name': 1,
          'author.email': 1,
          'author.avatarUrl': 1,
          comments: 1,
          commentCount: { $size: '$comments' },
        },
      },
    ]);

    if (!result.length) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return result[0];
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<Post> {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Ownership check — only the author can update
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return (await this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec()) as Post;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Ownership check
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postModel.findByIdAndDelete(id).exec();
    return { message: 'Post deleted successfully' };
  }
}
