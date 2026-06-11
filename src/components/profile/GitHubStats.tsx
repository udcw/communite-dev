'use client';

import { useEffect, useState } from 'react';
import { FaGithub, FaStar, FaCodeBranch, FaRepository } from 'react-icons/fa';

interface GitHubStatsProps {
  username: string;
}

export default function GitHubStats({ username }: GitHubStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetch(`/api/github/${username}`)
        .then(res => res.json())
        .then(data => {
          setStats(data.stats);
          setLoading(false);
        });
    }
  }, [username]);

  if (!username) return null;
  if (loading) return <div className="text-sm text-gray-500">Chargement GitHub...</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <FaGithub /> Activité GitHub
      </h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xl font-bold">{stats?.totalRepos || 0}</p>
          <p className="text-xs text-gray-500">Repos</p>
        </div>
        <div>
          <p className="text-xl font-bold">{stats?.totalStars || 0}</p>
          <p className="text-xs text-gray-500">Stars</p>
        </div>
        <div>
          <p className="text-xl font-bold">{stats?.totalForks || 0}</p>
          <p className="text-xs text-gray-500">Forks</p>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium mb-1">Langages principaux</p>
        <div className="flex flex-wrap gap-1">
          {stats?.languages?.slice(0, 5).map((lang: string) => (
            <span key={lang} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              {lang}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}