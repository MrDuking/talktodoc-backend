import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/index';
import { CreateUserDto, UpdateUserDto } from './dtos/index';
import { UserServiceInterface } from '../shared/user-service.interface';

@Injectable()
export class UsersService implements UserServiceInterface {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error:any) {
      console.error('Error fetching users:', error.message);
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error:any) {
      console.error('Error finding user:', error.message);
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error:any) {
      console.error('Error creating user:', error.message);
      if (error.code === 11000) {
        throw new BadRequestException('Username or Email already exists');
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
      if (!updatedUser) {
        throw new NotFoundException('User not found to update');
      }
      return updatedUser;
    } catch (error:any) {
      console.error('Error updating user:', error.message);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException('User not found to delete');
      }
    } catch (error:any) {
      console.error('Error deleting user:', error.message);
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
