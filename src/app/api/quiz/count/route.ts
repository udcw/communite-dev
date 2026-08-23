import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function GET() {
  try {
    await connectDB();
    const count = await Quiz.countDocuments({ isActive: true });
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
