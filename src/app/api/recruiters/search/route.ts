import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const technology = searchParams.get('technology');
    const location = searchParams.get('location');
    const minScore = parseInt(searchParams.get('minScore') || '0');
    
    await connectDB();
    
    let query: any = {};
    if (technology) {
      query.technologies = { $regex: technology, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    const users = await User.find(query);
    
    // Calculer le score réel pour chaque utilisateur (comme dans ScoreCard)
    const results = await Promise.all(users.map(async (user) => {
      // Récupérer les posts et commentaires
      const userPosts = await Post.find({ authorEmail: user.email });
      const userComments = await Comment.find({ authorEmail: user.email });
      
      // Calculer les likes reçus
      let totalLikesReceived = 0;
      userPosts.forEach(post => {
        totalLikesReceived += post.likes || 0;
      });
      
      // Score GitHub
      let githubScore = 0;
      if (user.githubUsername) {
        try {
          const reposRes = await fetch(`https://api.github.com/users/${user.githubUsername}/repos?per_page=100`);
          const repos = await reposRes.json();
          const totalRepos = Array.isArray(repos) ? repos.length : 0;
          const totalStars = Array.isArray(repos) ? repos.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0) : 0;
          
          const repoScore = Math.min(totalRepos, 30);
          const starScore = Math.min(Math.floor(totalStars / 3.5), 30);
          githubScore = repoScore + starScore;
        } catch (error) {
          console.error('Erreur GitHub:', error);
        }
      }
      
      // Score local
      const postScore = Math.min(userPosts.length * 5, 30);
      const commentScore = Math.min(userComments.length * 2, 20);
      const likeScore = Math.min(Math.floor(totalLikesReceived / 2), 20);
      const techScore = Math.min((user.technologies?.length || 0) * 4, 30);
      
      const localScore = postScore + commentScore + likeScore + techScore;
      
      // Score global
      const globalScore = Math.min(githubScore + localScore, 100);
      
      return {
        ...user.toObject(),
        estimatedScore: globalScore,
        profileUrl: `/profile/${encodeURIComponent(user.email)}`
      };
    }));
    
    // Filtrer par score minimum
    const filteredResults = results.filter(u => u.estimatedScore >= minScore);
    filteredResults.sort((a, b) => b.estimatedScore - a.estimatedScore);
    
    return NextResponse.json({
      total: filteredResults.length,
      candidates: filteredResults
    });
    
  } catch (error) {
    console.error('Erreur recherche:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}