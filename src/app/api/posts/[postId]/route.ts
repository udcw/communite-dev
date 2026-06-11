import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';

// GET - Récupérer un post spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    await connectDB();
    const post = await Post.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier un post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { postId } = await params;
    await connectDB();
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }
    
    // Vérifier que l'utilisateur est l'auteur
    if (post.authorEmail !== session.user.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const body = await req.json();
    const { title, content, imageUrl } = body;
    
    // Validation
    if (!title || title.length < 3 || title.length > 100) {
      return NextResponse.json({ error: 'Titre invalide (3-100 caractères)' }, { status: 400 });
    }
    
    if (!content || content.length < 10 || content.length > 5000) {
      return NextResponse.json({ error: 'Contenu invalide (10-5000 caractères)' }, { status: 400 });
    }
    
    // Mise à jour
    post.title = title.replace(/[<>]/g, '');
    post.content = content.replace(/[<>]/g, '');
    post.imageUrl = imageUrl?.replace(/[<>]/g, '') || '';
    post.updatedAt = new Date();
    
    await post.save();
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Erreur modification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { postId } = await params;
    await connectDB();
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }
    
    // Vérifier que l'utilisateur est l'auteur
    if (post.authorEmail !== session.user.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    await Post.findByIdAndDelete(postId);
    
    return NextResponse.json({ message: 'Post supprimé' });
  } catch (error) {
    console.error('Erreur suppression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}