import mongoose, { Schema, model, models } from 'mongoose';

export interface IComment {
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  postId: mongoose.Types.ObjectId;
  likes: number;
  likedBy: string[];
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  content: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default models.Comment || model<IComment>('Comment', CommentSchema);