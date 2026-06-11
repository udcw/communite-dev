import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    
    console.log('Recherche des posts pour email:', decodedEmail);
    
    await connectDB();
    
    // Recherche exacte de l'email
    const posts = await Post.find({ authorEmail: decodedEmail })
      .sort({ createdAt: -1 });
    
    console.log(`${posts.length} posts trouvés pour ${decodedEmail}`);
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('❌ Erreur API posts utilisateur:', error);
    return NextResponse.json([], { status: 500 });
  }
}