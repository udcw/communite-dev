import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import Notification from '@/models/Notification';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    const { postId } = await params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }

    const userId = session.user.email;
    const hasLiked = post.likedBy.includes(userId);

    if (hasLiked) {
      post.likes--;
      post.likedBy = post.likedBy.filter((id: string) => id !== userId);
    } else {
      post.likes++;
      post.likedBy.push(userId);
    }

    await post.save();
    
    // Créer une notification seulement si ce n'est pas l'auteur qui like son propre post
    if (!hasLiked && post.authorEmail !== session.user.email) {
      await Notification.create({
        userId: post.authorEmail,
        type: 'like',
        fromUserId: session.user.email,
        fromUserName: session.user.name,
        postId: post._id,
        read: false
      });
    }
    
    return NextResponse.json({ likes: post.likes, liked: !hasLiked });
    
  } catch (error) {
    console.error('Erreur like:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}