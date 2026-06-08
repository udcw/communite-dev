import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET() {
  await connectDB();
  const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const { title, content, imageUrl } = body;

  // Validation
  if (!title || typeof title !== 'string' || title.length < 3 || title.length > 100) {
    return NextResponse.json({ error: 'Titre invalide (3-100 caractères)' }, { status: 400 });
  }

  if (!content || typeof content !== 'string' || content.length < 10 || content.length > 5000) {
    return NextResponse.json({ error: 'Contenu invalide (10-5000 caractères)' }, { status: 400 });
  }

  // Nettoyage basique (anti-XSS)
  const cleanTitle = title.replace(/[<>]/g, '');
  const cleanContent = content.replace(/[<>]/g, '');
  const cleanImageUrl = imageUrl?.replace(/[<>]/g, '') || '';

  const post = await Post.create({
    title: cleanTitle,
    content: cleanContent,
    imageUrl: cleanImageUrl,
    authorId: session.user.email,
    authorName: session.user.name,
    authorEmail: session.user.email,
  });

  return NextResponse.json(post, { status: 201 });
}