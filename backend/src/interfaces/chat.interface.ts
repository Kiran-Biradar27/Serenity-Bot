import { Document } from 'mongoose';
import { IUser } from './user.interface';

export interface EmotionalContext {
  facialEmotion?: string;
  voiceTone?: string;
  textSentiment?: string;
  combinedEmotionScore?: {
    happy?: number;
    sad?: number;
    angry?: number;
    anxious?: number;
    neutral?: number;
    stressed?: number;
    depressed?: number;
  };
}

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotionalContext?: EmotionalContext;
}

export interface IChat extends Document {
  user: IUser['_id'] | IUser;
  messages: IMessage[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
} 