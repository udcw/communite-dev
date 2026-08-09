import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

// Définir le type pour l'activité
interface ActivityItem {
  message: string;
  date: Date;
}

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    const posts = await Post.find({ authorEmail: session.user.email });
    const comments = await Comment.find({ authorEmail: session.user.email });

    // Calculer les likes reçus
    let likesReceived = 0;
    posts.forEach((post: any) => {
      likesReceived += post.likes || 0;
    });

    // Activité récente typée
    const recentActivity: ActivityItem[] = [];

    // Derniers posts
    posts.slice(0, 3).forEach((post: any) => {
      recentActivity.push({
        message: `📝 Vous avez publié "${post.title}"`,
        date: post.createdAt
      });
    });

    // Derniers commentaires
    comments.slice(0, 3).forEach((comment: any) => {
      recentActivity.push({
        message: `💬 Vous avez commenté un post`,
        date: comment.createdAt
      });
    });

    // Trier par date
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      stats: {
        posts: posts.length,
        comments: comments.length,
        likesReceived,
        score: 26, // À calculer plus tard
        applications: 0,
        views: 0
      },
      recentActivity: recentActivity.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}