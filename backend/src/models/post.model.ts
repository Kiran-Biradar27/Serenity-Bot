import mongoose, { Schema } from 'mongoose';
import { IPost, IComment } from '../interfaces/post.interface';

const CommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const PostSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: [CommentSchema],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IPost>('Post', PostSchema); 