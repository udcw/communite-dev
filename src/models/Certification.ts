import mongoose, { Schema, model, models } from 'mongoose';

export interface ICertification {
  userId: string;
  userName: string;
  quizId: string;        // ID unique du quiz (généré par nous)
  quizTitle: string;
  category: string;
  level: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date;
}

const CertificationSchema = new Schema<ICertification>({
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  quizId: { type: String, required: true, unique: true },
  quizTitle: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

export default models.Certification || model<ICertification>('Certification', CertificationSchema);
