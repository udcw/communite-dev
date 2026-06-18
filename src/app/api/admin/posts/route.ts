import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    
    // Vérifier si l'utilisateur est admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { postId } = await req.json();
    
    if (!postId) {
      return NextResponse.json({ error: 'ID du post requis' }, { status: 400 });
    }

    await Post.findByIdAndDelete(postId);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur suppression post:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}