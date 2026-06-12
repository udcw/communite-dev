import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET - Récupérer les notifications de l'utilisateur
export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  const notifications = await Notification.find({ 
    userId: session.user.email,
    read: false 
  }).sort({ createdAt: -1 }).limit(50);

  return NextResponse.json(notifications);
}

// PUT - Marquer une notification comme lue
export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { notificationId } = await req.json();
  await connectDB();
  
  await Notification.findByIdAndUpdate(notificationId, { read: true });
  
  return NextResponse.json({ success: true });
}