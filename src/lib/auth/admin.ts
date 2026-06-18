// src/lib/auth/admin.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function requireAdmin() {
  const session = await getServerSession();
  
  if (!session?.user) {
    return { error: 'Non authentifié', status: 401 };
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  
  if (user?.role !== 'admin') {
    return { error: 'Accès refusé - Droits administrateur requis', status: 403 };
  }

  return { user, status: 200 };
}