import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    
    await connectDB();
    
    // Récupérer l'utilisateur
    const user = await User.findOne({ email: decodedEmail });
    
    // Récupérer les posts, commentaires et likes de l'utilisateur
    const userPosts = await Post.find({ authorEmail: decodedEmail });
    const userComments = await Comment.find({ authorEmail: decodedEmail });
    
    // Calculer les likes reçus
    let totalLikesReceived = 0;
    userPosts.forEach(post => {
      totalLikesReceived += post.likes || 0;
    });
    
    // Données locales
    const localData = {
      postsCount: userPosts.length,
      commentsCount: userComments.length,
      likesReceived: totalLikesReceived,
      technologies: user?.technologies || [],
      skills: user?.skills || []
    };
    
    if (!user?.githubUsername) {
      // Score basé uniquement sur l'activité locale
      const postScore = Math.min(localData.postsCount * 5, 40);
      const commentScore = Math.min(localData.commentsCount * 2, 20);
      const likeScore = Math.min(Math.floor(localData.likesReceived / 2), 20);
      const techScore = Math.min(localData.technologies.length * 4, 20);
      
      const globalScore = postScore + commentScore + likeScore + techScore;
      
      return NextResponse.json({
        globalScore: Math.min(globalScore, 100),
        githubScore: 0,
        localData: {
          posts: localData.postsCount,
          comments: localData.commentsCount,
          likesReceived: localData.likesReceived,
          technologies: localData.technologies.length,
          skills: localData.skills.length
        },
        technologyScores: {},
        message: !user?.githubUsername ? 'Connectez votre compte GitHub pour un score complet' : null
      });
    }
    
    // Récupérer TOUTES les données GitHub
    const githubUsername = user.githubUsername;
    
    // 1. Récupérer le profil utilisateur
    const userRes = await fetch(`https://api.github.com/users/${githubUsername}`);
    const githubUser = await userRes.json();
    
    // 2. Récupérer tous les repos
    const reposRes = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`);
    const repos = await reposRes.json();
    
    // 3. Récupérer les événements (commits, PRs, issues)
    const eventsRes = await fetch(`https://api.github.com/users/${githubUsername}/events/public?per_page=100`);
    const events = await eventsRes.json();
    
    // 4. Récupérer les langages utilisés
    const languageStats: Record<string, { count: number; bytes: number }> = {};
    
    // Analyser les repos pour les langages
    for (const repo of (repos as any[])) {
      if (repo.language) {
        if (!languageStats[repo.language]) {
          languageStats[repo.language] = { count: 0, bytes: 0 };
        }
        languageStats[repo.language].count++;
      }
      
      // Récupérer les langages détaillés pour les repos principaux
      if (repo.languages_url && repo.stargazers_count > 0) {
        try {
          const langRes = await fetch(repo.languages_url);
          const langs = await langRes.json();
          for (const [lang, bytes] of Object.entries(langs)) {
            if (!languageStats[lang]) {
              languageStats[lang] = { count: 0, bytes: 0 };
            }
            languageStats[lang].bytes += bytes as number;
          }
        } catch (e) {
          // Ignorer les erreurs
        }
      }
    }
    
    // Calculer les statistiques
    const totalRepos = repos.length;
    const totalStars = repos.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0);
    const totalForks = repos.reduce((acc: number, repo: any) => acc + (repo.forks_count || 0), 0);
    
    // Compter les commits
    const totalCommits = events.filter((e: any) => e.type === 'PushEvent').length;
    const totalPRs = events.filter((e: any) => e.type === 'PullRequestEvent').length;
    const totalIssues = events.filter((e: any) => e.type === 'IssuesEvent').length;
    
    // Score GitHub (0-100)
    const repoScore = Math.min(totalRepos, 30);
    const starScore = Math.min(Math.floor(totalStars / 3.5), 30);
    const commitScore = Math.min(Math.floor(totalCommits / 10), 20);
    const contributionScore = Math.min((totalPRs + totalIssues) * 2, 20);
    
    const githubScore = repoScore + starScore + commitScore + contributionScore;
    
    // Scores par technologie (basés sur les langages GitHub)
    const technologyScores: Record<string, number> = {};
    
    // Mapping des langages vers les technologies
    const techMapping: Record<string, string[]> = {
      'TypeScript': ['TypeScript', 'React', 'Next.js', 'Node.js'],
      'JavaScript': ['JavaScript', 'React', 'Node.js'],
      'Python': ['Python', 'Django', 'Flask'],
      'Java': ['Java', 'Spring Boot'],
      'Go': ['Go', 'Microservices'],
      'Rust': ['Rust', 'System Programming'],
      'PHP': ['PHP', 'Laravel', 'Symfony'],
      'Ruby': ['Ruby', 'Rails'],
      'Swift': ['Swift', 'iOS'],
      'Kotlin': ['Kotlin', 'Android'],
      'C#': ['C#', '.NET'],
      'C++': ['C++', 'Game Dev'],
      'HTML': ['HTML', 'CSS'],
      'CSS': ['CSS', 'TailwindCSS'],
      'SCSS': ['SCSS', 'Sass'],
      'Vue': ['Vue.js'],
      'Angular': ['Angular'],
    };
    
    // Calculer les scores pour chaque technologie
    for (const [lang, stats] of Object.entries(languageStats)) {
      const technologies = techMapping[lang] || [lang];
      const langScore = Math.min(
        (stats.count * 5) + Math.floor(stats.bytes / 10000),
        100
      );
      
      for (const tech of technologies) {
        if (!technologyScores[tech] || technologyScores[tech] < langScore) {
          technologyScores[tech] = Math.min(langScore, 100);
        }
      }
    }
    
    // Ajouter des scores basés sur les posts et commentaires locaux
    for (const tech of (user?.technologies || [])) {
      if (!technologyScores[tech]) {
        technologyScores[tech] = 0;
      }
      
      // Bonus pour les posts sur cette technologie
      const techPosts = userPosts.filter(p => 
        p.title.toLowerCase().includes(tech.toLowerCase()) || 
        p.content.toLowerCase().includes(tech.toLowerCase())
      );
      technologyScores[tech] += Math.min(techPosts.length * 5, 30);
      
      // Bonus pour les commentaires
      const techComments = userComments.filter(c => 
        c.content.toLowerCase().includes(tech.toLowerCase())
      );
      technologyScores[tech] += Math.min(techComments.length * 2, 20);
      
      technologyScores[tech] = Math.min(technologyScores[tech], 100);
    }
    
    // Score local (posts, commentaires, likes)
    const postScore = Math.min(localData.postsCount * 2, 20);
    const commentScore = Math.min(localData.commentsCount, 15);
    const likeScore = Math.min(Math.floor(localData.likesReceived / 2), 15);
    const techCountScore = Math.min(localData.technologies.length * 3, 20);
    
    const localActivityScore = postScore + commentScore + likeScore + techCountScore;
    
    // Score global (60% GitHub, 40% activité locale)
    const globalScore = Math.floor((githubScore * 0.6) + (localActivityScore * 0.4));
    
    // Ajouter les technologies populaires non détectées
    const commonTechs = ['React', 'Next.js', 'Node.js', 'Docker', 'Git', 'MongoDB', 'PostgreSQL'];
    for (const tech of commonTechs) {
      if (!technologyScores[tech]) {
        technologyScores[tech] = 0;
      }
    }
    
    return NextResponse.json({
      globalScore: Math.min(globalScore, 100),
      githubScore,
      localActivityScore,
      githubData: {
        username: githubUsername,
        name: githubUser.name || githubUsername,
        avatar: githubUser.avatar_url,
        followers: githubUser.followers,
        following: githubUser.following,
        publicRepos: totalRepos,
        totalStars,
        totalForks,
        totalCommits,
        totalPRs,
        totalIssues,
        joinedDate: githubUser.created_at
      },
      localData: {
        posts: localData.postsCount,
        comments: localData.commentsCount,
        likesReceived: localData.likesReceived,
        technologies: localData.technologies.length,
        skills: localData.skills.length
      },
      contributions: {
        repos: totalRepos,
        stars: totalStars,
        forks: totalForks,
        commits: totalCommits,
        pullRequests: totalPRs,
        issues: totalIssues,
        posts: localData.postsCount,
        comments: localData.commentsCount,
        likesReceived: localData.likesReceived
      },
      technologyScores: Object.fromEntries(
        Object.entries(technologyScores)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 12)
      ),
      languages: Object.keys(languageStats).slice(0, 10)
    });
    
  } catch (error) {
    console.error('Erreur calcul score GitHub:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}