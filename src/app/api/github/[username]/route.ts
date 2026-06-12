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
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userRes.json();
    
    if (userData.message === 'Not Found') {
      return NextResponse.json({ error: 'Utilisateur GitHub non trouvé' }, { status: 404 });
    }
    
  
   // Récupérer tous les repos (max 100)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated&direction=desc`);
    const reposData = await reposRes.json();
    
    // Récupérer les contributions (commits récents)
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`);
    const eventsData = await eventsRes.json();
    
    const commitCount = eventsData.filter((e: any) => e.type === 'PushEvent').length;
    const prCount = eventsData.filter((e: any) => e.type === 'PullRequestEvent').length;
    const starCount = Array.isArray(reposData) ? reposData.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0) : 0;
    
    // Extraire les langages utilisés
    const languages: Record<string, number> = {};
    if (Array.isArray(reposData)) {
      reposData.forEach((repo: any) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });
    }
    
    // Préparer les projets - tous les repos (max 50)
    const projects = Array.isArray(reposData) ? reposData.map((repo: any) => ({
      name: repo.name,
      description: repo.description || 'Aucune description',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || 'Non spécifié',
      url: repo.html_url,
      updatedAt: repo.updated_at
    })) : [];
    
    return NextResponse.json({
      user: {
        login: userData.login,
        name: userData.name,
        avatar: userData.avatar_url,
        bio: userData.bio,
        followers: userData.followers,
        following: userData.following,
        publicRepos: userData.public_repos
      },
      stats: {
        commitCount,
        prCount,
        starCount,
        languages: Object.keys(languages).slice(0, 5)
      },
      projects
    });
  } catch (error) {
    console.error('Erreur GitHub API:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}