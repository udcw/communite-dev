import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    // Récupérer l'email depuis les paramètres de l'URL
    const url = new URL(req.url);
    const emailParam = url.searchParams.get('email');
    const searchEmail = emailParam || session.user.email;
    
    await connectDB();
    const user = await User.findOne({ email: searchEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      skills: user.skills || [],
      technologies: user.technologies || [],
      githubUsername: user.githubUsername || '',
      linkedinUrl: user.linkedinUrl || '',
      portfolioUrl: user.portfolioUrl || '',
      title: user.title || '',
      company: user.company || '',
      location: user.location || '',
    });
  } catch (error) {
    console.error('Erreur GET profile:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    await connectDB();
    const body = await req.json();
    const { bio, skills, technologies, githubUsername, linkedinUrl, portfolioUrl, title, company, location } = body;
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        bio: bio || '',
        skills: skills || [],
        technologies: technologies || [],
        githubUsername: githubUsername || '',
        linkedinUrl: linkedinUrl || '',
        portfolioUrl: portfolioUrl || '',
        title: title || '',
        company: company || '',
        location: location || '',
      },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PUT profile:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}