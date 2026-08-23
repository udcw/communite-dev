import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userEmail = session.user.email;
    await connectDB();

    const user = await User.findOne({ email: userEmail });
    const posts = await Post.find({ authorEmail: userEmail });
    const comments = await Comment.find({ authorEmail: userEmail });

    let likesReceived = 0;
    posts.forEach((post: any) => {
      likesReceived += post.likes || 0;
    });

    let githubScore = 0;
    let githubUsername = user?.githubUsername || '';

    if (githubUsername) {
      try {
        const reposRes = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100`);
        const repos = await reposRes.json();

        const repoCount = Array.isArray(repos) ? repos.length : 0;
        const stars = Array.isArray(repos) ? repos.reduce((acc: any, repo: any) => acc + (repo.stargazers_count || 0), 0) : 0;
        const forks = Array.isArray(repos) ? repos.reduce((acc: any, repo: any) => acc + (repo.forks_count || 0), 0) : 0;

        githubScore = Math.min(
          (repoCount * 2) + Math.floor(stars / 3) + Math.floor(forks / 5),
          60
        );
      } catch (error) {
        console.error('Erreur GitHub:', error);
      }
    }

    const postScore = Math.min(posts.length * 5, 30);
    const commentScore = Math.min(comments.length * 2, 20);
    const likeScore = Math.min(Math.floor(likesReceived / 2), 20);
    const techScore = Math.min((user?.technologies?.length || 0) * 3, 20);

    const localScore = postScore + commentScore + likeScore + techScore;
    const totalScore = Math.min(githubScore + localScore, 100);

    let level = 'Débutant';
    let levelColor = 'text-red-400';
    if (totalScore >= 80) { level = 'Expert'; levelColor = 'text-green-400'; }
    else if (totalScore >= 60) { level = 'Avancé'; levelColor = 'text-yellow-400'; }
    else if (totalScore >= 40) { level = 'Intermédiaire'; levelColor = 'text-orange-400'; }

    const badges = [];
    if (posts.length >= 1) badges.push('Premier post');
    if (posts.length >= 5) badges.push('5 posts');
    if (comments.length >= 1) badges.push('Premier commentaire');
    if (likesReceived >= 5) badges.push('5 likes reçus');
    if (githubUsername) badges.push('GitHub connecté');
    if (user?.technologies?.length >= 3) badges.push('Tech stack');

    return NextResponse.json({
      totalScore,
      githubScore,
      localScore,
      level,
      levelColor,
      badges: badges.slice(0, 6),
      details: {
        posts: posts.length,
        comments: comments.length,
        likesReceived,
        technologies: user?.technologies?.length || 0,
        githubUsername: githubUsername || 'Non connecté'
      }
    });

  } catch (error) {
    console.error('Erreur score:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}