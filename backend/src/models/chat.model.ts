import mongoose, { Schema } from 'mongoose';
import { IChat, IMessage } from '../interfaces/chat.interface';

const EmotionalScoreSchema: Schema = new Schema({
  happy: Number,
  sad: Number,
  angry: Number,
  anxious: Number,
  neutral: Number,
  stressed: Number,
  depressed: Number,
}, { _id: false });

const EmotionalContextSchema: Schema = new Schema({
  facialEmotion: String,
  voiceTone: String,
  textSentiment: String,
  combinedEmotionScore: EmotionalScoreSchema
}, { _id: false });

const MessageSchema: Schema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  emotionalContext: EmotionalContextSchema
});

const ChatSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messages: [MessageSchema],
    title: {
      type: String,
      default: 'New Chat'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IChat>('Chat', ChatSchema); 