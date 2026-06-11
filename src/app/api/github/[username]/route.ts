import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    if (!username) {
      return NextResponse.json({ error: 'Nom d\'utilisateur requis' }, { status: 400 });
    }
    
    // Récupérer les infos utilisateur GitHub
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Utilisateur GitHub non trouvé' }, { status: 404 });
    }
    
    const userData = await userRes.json();
    
    // Récupérer les repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: { 'Accept': 'application/json' }
    });
    
    const reposData = await reposRes.json();
    
    // Calculer les stats
    const stats = {
      totalRepos: Array.isArray(reposData) ? reposData.length : 0,
      totalStars: Array.isArray(reposData) ? reposData.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0) : 0,
      totalForks: Array.isArray(reposData) ? reposData.reduce((acc: number, repo: any) => acc + (repo.forks_count || 0), 0) : 0,
      languages: Array.isArray(reposData) ? [...new Set(reposData.map((repo: any) => repo.language).filter(Boolean))] : [],
    };
    
    return NextResponse.json({ user: userData, stats });
  } catch (error) {
    console.error('Erreur GitHub API:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des données GitHub' }, { status: 500 });
  }
}