import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  email: string;
  name: string;
  githubId?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  // Portfolio fields
  title?: string;
  company?: string;
  location?: string;
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
  // Portfolio fields
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, maxlength: 500, default: '' },
  skills: [{ type: String, default: [] }],
  technologies: [{ type: String, default: [] }],
  githubUsername: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  cvUrl: { type: String, default: '' },
  certifications: [{
    name: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    issuer: { type: String, default: '' }
  }]
});

export default models.User || model<IUser>('User', UserSchema);