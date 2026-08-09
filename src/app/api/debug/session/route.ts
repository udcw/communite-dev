import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession();
  return NextResponse.json({
    email: session?.user?.email || 'Aucun email',
    name: session?.user?.name || 'Aucun nom',
    hasSession: !!session
  });
}
