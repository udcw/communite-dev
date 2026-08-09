import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userEmail = session.user.email;
    console.log('📧 Email de session :', userEmail);

    await connectDB();

    const posts = await Post.find({ authorEmail: userEmail });
    const comments = await Comment.find({ authorEmail: userEmail });

    console.log(` ${posts.length} posts trouvés pour ${userEmail}`);
    console.log(` ${comments.length} commentaires trouvés`);

    let likesReceived = 0;
    posts.forEach((post: any) => {
      likesReceived += post.likes || 0;
    });

    const recentActivity: { message: string; date: Date }[] = [];

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
        score: 0,
        applications: 0,
        views: 0
      },
      recentActivity: recentActivity.slice(0, 10)
    });

  } catch (error) {
    console.error(' Erreur dashboard:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

