import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  /** Creates a new post. */
  async create(createPostDto: CreatePostDto, userId: string): Promise<PostDocument> {
    const newPost = new this.postModel({ ...createPostDto, author: userId });
    return await newPost.save();
  }

  /** Retrieves all posts with author information and comment counts. */
  async findAll(): Promise<Post[]> {
    return await this.postModel.aggregate([
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
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments',
        },
      },
      {
        $project: {
          _id: 1,
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
      {
        $sort: { createdAt: -1 },
      },
    ]);
  }

  /** Retrieves a single post by its ID, including author and comments. */
  async findOne(id: string): Promise<Post[]> {
    return await this.postModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(id) },
      },
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
      {
        $project: {
          _id: 1,
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
  }

  /** Finds a post by ID (simple find). */
  async findById(id: string): Promise<PostDocument | null> {
    return await this.postModel.findById(id);
  }

  /** Updates an existing post. */
  async update(id: string, updatePostDto: UpdatePostDto): Promise<PostDocument | null> {
    return await this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec();
  }

  /** Deletes a post within a session. */
  async delete(id: string, session: ClientSession): Promise<void> {
    await this.postModel.findByIdAndDelete(id).session(session);
  }
}
