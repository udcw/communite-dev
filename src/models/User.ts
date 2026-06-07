import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  email: string;
  name: string;
  githubId?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  githubId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || model<IUser>('User', UserSchema);