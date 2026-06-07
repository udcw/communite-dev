import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET() {
  try {
    console.log('1. Début de la requête GET /api/posts');
    
    console.log('2. Tentative de connexion à MongoDB...');
    await connectDB();
    console.log('3. Connecté à MongoDB avec succès');
    
    console.log('4. Recherche des posts...');
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
    console.log(`5. ${posts.length} posts trouvés`);
    
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('ERREUR:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    const { title, content } = await req.json();

    const post = await Post.create({
      title,
      content,
      authorId: session.user.email,
      authorName: session.user.name,
      authorEmail: session.user.email,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('ERREUR POST:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}