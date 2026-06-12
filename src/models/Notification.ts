import mongoose, { Schema, model, models } from 'mongoose';

export interface INotification {
  userId: string;
  type: 'like' | 'comment' | 'follow';
  fromUserId: string;
  fromUserName: string;
  postId?: string;
  commentId?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
  fromUserId: { type: String, required: true },
  fromUserName: { type: String, required: true },
  postId: { type: String },
  commentId: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default models.Notification || model<INotification>('Notification', NotificationSchema);