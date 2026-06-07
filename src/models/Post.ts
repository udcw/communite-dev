import mongoose, { Schema, model, models } from 'mongoose';

export interface IPost {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  likes: number;
  likedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Post || model<IPost>('Post', PostSchema);