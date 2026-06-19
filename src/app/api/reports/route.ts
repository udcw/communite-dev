import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import Post from '@/models/Post';

// GET - Récupérer tous les signalements (admin uniquement)
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    const reports = await Report.find().sort({ createdAt: -1 });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Erreur GET reports:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un signalement
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    const { postId, reason } = await req.json();

    if (!postId || !reason) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier que le post existe
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur n'a pas déjà signalé ce post
    const existingReport = await Report.findOne({ 
      postId, 
      reportedBy: session.user.email 
    });
    
    if (existingReport) {
      return NextResponse.json({ error: 'Vous avez déjà signalé ce post' }, { status: 400 });
    }

    const report = await Report.create({
      postId,
      postTitle: post.title || 'Sans titre',
      postAuthor: post.authorName || 'Inconnu',
      reportedBy: session.user.email,
      reason,
      status: 'pending'
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Erreur POST report:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}