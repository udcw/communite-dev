// src/app/api/admin/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import { requireAdmin } from '@/lib/auth/admin';

export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck.status !== 200) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  const { postId } = await req.json();
  await connectDB();
  
  await Post.findByIdAndDelete(postId);
  return NextResponse.json({ success: true });
}