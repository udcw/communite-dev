import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';

// GET - Récupérer les commentaires d'un post
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();
    const comments = await Comment.find({ postId: params.postId })
      .sort({ createdAt: -1 });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un commentaire
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    await connectDB();
    const { content } = await req.json();
    
    // Validation
    if (!content || content.length < 2 || content.length > 500) {
      return NextResponse.json({ error: 'Commentaire invalide (2-500 caractères)' }, { status: 400 });
    }

    const comment = await Comment.create({
      content,
      authorId: session.user.email,
      authorName: session.user.name,
      authorEmail: session.user.email,
      postId: params.postId,
    });

    // Ajouter le commentaire au post
    await Post.findByIdAndUpdate(params.postId, {
      $push: { comments: comment._id }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}