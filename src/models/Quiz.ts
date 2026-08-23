import mongoose, { Schema, model, models } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IQuiz {
  title: string;
  description: string;
  category: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  questions: IQuestion[];
  passingScore: number;
  duration: number;
  createdBy: string;
  isActive: boolean;
  attempts: number;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: '' }
});

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['Débutant', 'Intermédiaire', 'Avancé'], required: true },
  questions: [QuestionSchema],
  passingScore: { type: Number, required: true, default: 70 },
  duration: { type: Number, required: true, default: 30 },
  createdBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default models.Quiz || model<IQuiz>('Quiz', QuizSchema);
