import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import Post from '@/models/Post';

// GET - Récupérer tous les signalements (admin uniquement)
export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  const reports = await Report.find().sort({ createdAt: -1 });
  return NextResponse.json(reports);
}

// POST - Créer un signalement
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  const { postId, reason } = await req.json();

  // Vérifier que le post existe
  const post = await Post.findById(postId);
  if (!post) {
    return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
  }

  // Vérifier que l'utilisateur n'a pas déjà signalé ce post
  const existingReport = await Report.findOne({ postId, reportedBy: session.user.email });
  if (existingReport) {
    return NextResponse.json({ error: 'Vous avez déjà signalé ce post' }, { status: 400 });
  }

  const report = await Report.create({
    postId,
    postTitle: post.title,
    postAuthor: post.authorName,
    reportedBy: session.user.email,
    reason,
    status: 'pending'
  });

  return NextResponse.json(report, { status: 201 });
}