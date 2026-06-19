import mongoose, { Schema, model, models } from 'mongoose';

export interface IReport {
  postId: string;
  postTitle: string;
  postAuthor: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
  postId: { type: String, required: true },
  postTitle: { type: String, required: true },
  postAuthor: { type: String, required: true },
  reportedBy: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'resolved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default models.Report || model<IReport>('Report', ReportSchema);