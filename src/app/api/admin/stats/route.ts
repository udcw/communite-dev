// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET() {
  // Vérifier que l'utilisateur est admin
  const adminCheck = await requireAdmin();
  if (adminCheck.status !== 200) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  await connectDB();

  const [totalUsers, totalPosts, totalComments] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Comment.countDocuments()
  ]);

  // Récupérer les utilisateurs avec leur rôle
  const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(10);
  
  // Récupérer les posts récents
  const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(10);

  return NextResponse.json({
    stats: { totalUsers, totalPosts, totalComments },
    users,
    recentPosts
  });
}