import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import Notification from '@/models/Notification';

// GET - Récupérer les commentaires d'un post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    await connectDB();
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un commentaire
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const { postId } = await params;
    await connectDB();
    const { content } = await req.json();
    
    // Validation
    if (!content || content.length < 2 || content.length > 500) {
      return NextResponse.json({ error: 'Commentaire invalide (2-500 caractères)' }, { status: 400 });
    }

    // Récupérer le post pour connaître l'auteur
    const post = await Post.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }

    const comment = await Comment.create({
      content,
      authorId: session.user.email,
      authorName: session.user.name,
      authorEmail: session.user.email,
      postId,
    });

    // Ajouter le commentaire au post
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });
    
    // Créer une notification pour l'auteur du post (sauf si c'est lui-même qui commente)
    if (post.authorEmail !== session.user.email) {
      await Notification.create({
        userId: post.authorEmail,
        type: 'comment',
        fromUserId: session.user.email,
        fromUserName: session.user.name,
        postId: postId,
        commentId: comment._id,
        read: false
      });
    }
    
    return NextResponse.json(comment, { status: 201 });
    
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}