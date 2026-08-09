// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

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

    const userEmail = session.user.email;
    console.log(' Email de session :', userEmail);

    await connectDB();

    // 1. Récupérer les posts avec l'email de session
    const posts = await Post.find({ authorEmail: userEmail });
    const comments = await Comment.find({ authorEmail: userEmail });

    console.log(`${posts.length} posts trouvés pour ${userEmail}`);
    console.log(` ${comments.length} commentaires trouvés pour ${userEmail}`);

    // Afficher les premiers posts pour vérifier les emails
    if (posts.length > 0) {
      console.log('📄 Exemple de post :', {
        title: posts[0].title,
        authorEmail: posts[0].authorEmail
      });
    }

    // Calculer les likes reçus
    let likesReceived = 0;
    posts.forEach((post: any) => {
      likesReceived += post.likes || 0;
    });

    // Activité récente
    const recentActivity: ActivityItem[] = [];

    posts.slice(0, 3).forEach((post: any) => {
      recentActivity.push({
        message: ` Vous avez publié "${post.title}"`,
        date: post.createdAt
      });
    });

    comments.slice(0, 3).forEach((comment: any) => {
      recentActivity.push({
        message: ` Vous avez commenté un post`,
        date: comment.createdAt
      });
    });

    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      stats: {
        posts: posts.length,
        comments: comments.length,
        likesReceived,
        score: 26,
        applications: 0,
        views: 0
      },
      recentActivity: recentActivity.slice(0, 10)
    });

  } catch (error) {
    console.error(' Erreur dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}