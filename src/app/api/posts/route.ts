import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';

export async function POST(req: NextRequest) {
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
}

export async function GET() {
  await connectDB();
  const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
  return NextResponse.json(posts);
}