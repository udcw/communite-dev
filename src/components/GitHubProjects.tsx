'use client';

import { useEffect, useState } from 'react';
import { FaStar, FaCodeBranch, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';

interface Project {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
}

interface GitHubProjectsProps {
  username: string;
}

export default function GitHubProjects({ username }: GitHubProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer les repos GitHub
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=6&sort=updated&direction=desc`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Utilisateur GitHub "${username}" non trouvé`);
          }
          throw new Error(`Erreur GitHub: ${res.status}`);
        }
        
        const repos = await res.json();
        
        const formattedProjects = repos.map((repo: any) => ({
          name: repo.name,
          description: repo.description || 'Aucune description',
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          language: repo.language || 'Non spécifié',
          url: repo.html_url
        }));
        
        setProjects(formattedProjects);
      } catch (err) {
        console.error('Erreur chargement projets GitHub:', err);
        setError(err instanceof Error ? err.message : 'Impossible de charger les projets');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [username]);

  if (!username) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-center gap-3 py-4">
          <FaSpinner className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-sm text-gray-400">Chargement des projets GitHub...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            {username ? `Nom d'utilisateur: ${username}` : 'Aucun nom d\'utilisateur GitHub configuré'}
          </p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mt-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-400">Aucun projet GitHub public</p>
          <p className="text-xs text-gray-500 mt-1">Les repos privés ne sont pas affichés</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <FaCodeBranch className="w-4 h-4" />
        Projets GitHub ({projects.length})
      </h3>
      <div className="grid gap-3">
        {projects.map((project) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 hover:shadow-md transition border border-gray-200 dark:border-gray-700 group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm group-hover:text-blue-500 transition">
                  {project.name}
                </h4>
                {project.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
              <FaExternalLinkAlt className="w-3 h-3 text-gray-400 flex-shrink-0 mt-1 group-hover:text-blue-400 transition" />
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
              {project.language && project.language !== 'Non spécifié' && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {project.language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FaStar className="w-3 h-3" /> {project.stars}
              </span>
              <span className="flex items-center gap-1">
                <FaCodeBranch className="w-3 h-3" /> {project.forks}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}