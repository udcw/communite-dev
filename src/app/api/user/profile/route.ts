import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  await connectDB();
  const { bio, skills, technologies, githubUsername, linkedinUrl, portfolioUrl } = await req.json();
  
  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { bio, skills, technologies, githubUsername, linkedinUrl, portfolioUrl },
    { new: true }
  );
  
  return NextResponse.json(user);
}

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  
  return NextResponse.json(user);
}