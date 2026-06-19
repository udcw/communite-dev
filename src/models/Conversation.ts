import mongoose, { Schema, model, models } from 'mongoose';

export interface IMessage {
  senderId: string;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface IConversation {
  participants: string[];
  messages: IMessage[];
  lastMessage: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema<IConversation>({
  participants: [{ type: String, required: true }],
  messages: [MessageSchema],
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.Conversation || model<IConversation>('Conversation', ConversationSchema);