import { Document } from 'mongoose';
import { IUser } from './user.interface';

export interface IPost extends Document {
  content: string;
  author: IUser['_id'] | IUser;
  isAnonymous: boolean;
  likes: number;
  comments: IComment[];
  createdAt: Date;
}

export interface IComment extends Document {
  content: string;
  author: IUser['_id'] | IUser;
  isAnonymous: boolean;
  likes: number;
  createdAt: Date;
} 