// src/components/ScoreBadge.tsx
'use client';

import { useState, useEffect } from 'react';

interface ScoreData {
  totalScore: number;
  githubScore: number;
  localScore: number;
  level: string;
  levelColor: string;
  badges: string[];
  details: {
    posts: number;
    comments: number;
    likesReceived: number;
    technologies: number;
    githubUsername: string;
  };
}

export default function ScoreBadge({ email }: { email?: string }) {
  const [score, setScore] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const url = email
          ? `/api/score/${encodeURIComponent(email)}`
          : '/api/score';
        const res = await fetch(url);
        const data = await res.json();
        setScore(data);
      } catch (error) {
        console.error('Erreur chargement score:', error);
      }
      setLoading(false);
    };
    fetchScore();
  }, [email]);

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
    );
  }

  if (!score) return null;

  const levelEmojis: Record<string, string> = {
    Expert: '🏆',
    Avancé: '⭐',
    Intermédiaire: '📚',
    Débutant: '🌱',
  };

  const badgeEmojis: Record<string, string> = {
    'Premier post': '📝',
    '5 posts': '✍️',
    'Premier commentaire': '💬',
    '5 likes reçus': '❤️',
    'GitHub connecté': '🔗',
    'Tech stack': '💻',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-yellow-500 text-xl">🏆</span>
          Score de compétence
        </h3>
        <span className={`text-2xl font-bold ${score.levelColor}`}>
          {score.totalScore}/100
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold flex items-center gap-1">
          <span>{levelEmojis[score.level] || '📊'}</span>
          {score.level}
        </span>
        <span className="text-xs text-gray-400">
          ({score.githubScore} GitHub · {score.localScore} local)
        </span>
      </div>

      {score.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {score.badges.map((badge, index) => (
            <span
              key={index}
              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs flex items-center gap-1"
            >
              <span>{badgeEmojis[badge] || '🏅'}</span>
              {badge}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="text-gray-500">📝 Posts</p>
          <p className="font-semibold">{score.details.posts}</p>
        </div>
        <div>
          <p className="text-gray-500">💬 Commentaires</p>
          <p className="font-semibold">{score.details.comments}</p>
        </div>
        <div>
          <p className="text-gray-500">❤️ Likes reçus</p>
          <p className="font-semibold">{score.details.likesReceived}</p>
        </div>
      </div>
    </div>
  );
}