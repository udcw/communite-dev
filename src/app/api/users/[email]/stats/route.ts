import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    
    await connectDB();
    
    const [postCount, commentCount, totalLikes] = await Promise.all([
      Post.countDocuments({ authorEmail: decodedEmail }),
      Comment.countDocuments({ authorEmail: decodedEmail }),
      Post.aggregate([
        { $match: { authorEmail: decodedEmail } },
        { $group: { _id: null, total: { $sum: '$likes' } } }
      ])
    ]);

    // Récupérer la date du premier post
    const firstPost = await Post.findOne({ authorEmail: decodedEmail }).sort({ createdAt: 1 });
    const memberSince = firstPost?.createdAt || new Date();

    return NextResponse.json({
      postCount,
      commentCount,
      totalLikes: totalLikes[0]?.total || 0,
      memberSince,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}