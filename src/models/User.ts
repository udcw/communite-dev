import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  email: string;
  name: string;
  githubId?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  bio?: string;
  skills: string[];
  technologies: string[];
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  cvUrl?: string;
  certifications: { name: string; date: Date; issuer: string }[];
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  githubId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  bio: { type: String, maxlength: 500 },
  skills: [{ type: String }],
  technologies: [{ type: String }],
  githubUsername: { type: String },
  linkedinUrl: { type: String },
  portfolioUrl: { type: String },
  cvUrl: { type: String },
  certifications: [{
    name: String,
    date: Date,
    issuer: String
  }]
});

export default models.User || model<IUser>('User', UserSchema);