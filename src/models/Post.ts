import mongoose, { Schema, model, models } from 'mongoose';

export interface IPost {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  likes: number;
  likedBy: string[];
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
imageUrl?: string;

}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', default: [] }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  imageUrl: { type: String, default: '' },

});

export default models.Post || model<IPost>('Post', PostSchema);