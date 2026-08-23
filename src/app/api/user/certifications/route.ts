import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Certification from '@/models/Certification';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  await connectDB();
  const certifications = await Certification.find({ userId: session.user.email });
  return NextResponse.json(certifications);
}
