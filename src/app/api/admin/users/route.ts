import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    
    // Vérifier si l'utilisateur est admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer tous les utilisateurs
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    console.log(`👥 ${users.length} utilisateurs trouvés`);

    return NextResponse.json(users);
    
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    
    // Vérifier si l'utilisateur est admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userId, role } = await req.json();

    // Vérifier que le rôle est valide
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Empêcher de se retirer les droits admin
    if (adminUser._id.toString() === userId && role === 'user') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas retirer vos propres droits admin' },
        { status: 403 }
      );
    }

    await User.findByIdAndUpdate(userId, { role });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour rôle:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}