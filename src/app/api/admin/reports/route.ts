import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import Post from '@/models/Post';
import User from '@/models/User';

// GET - Récupérer tous les signalements avec stats
export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  
  const admin = await User.findOne({ email: session.user.email });
  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const reports = await Report.find().sort({ createdAt: -1 });
  const pendingCount = await Report.countDocuments({ status: 'pending' });
  
  return NextResponse.json({ reports, pendingCount });
}

// PUT - Mettre à jour le statut d'un signalement
export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  
  const admin = await User.findOne({ email: session.user.email });
  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { reportId, status, action } = await req.json();

  const report = await Report.findById(reportId);
  if (!report) {
    return NextResponse.json({ error: 'Signalement non trouvé' }, { status: 404 });
  }

  // Si action === 'delete', supprimer le post
  if (action === 'delete' && status === 'resolved') {
    await Post.findByIdAndDelete(report.postId);
  }

  report.status = status;
  await report.save();

  return NextResponse.json({ success: true });
}