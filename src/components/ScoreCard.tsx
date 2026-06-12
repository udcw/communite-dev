'use client';

import { 
  FaTrophy, FaStar, FaCode, FaComments, FaHeart, FaChartLine, 
  FaGitAlt, FaBrain, FaRocket, FaAward, FaDatabase, FaCloud, 
  FaServer, FaLaptopCode, FaUserGraduate, FaCalendarCheck, 
  FaClipboardCheck, FaShieldAlt, FaSeedling, FaAws
} from 'react-icons/fa';
import { 
  SiTypescript, SiJavascript, SiReact, SiNextdotjs, SiNodedotjs, 
  SiPython, SiDocker, SiKubernetes, SiMongodb, SiPostgresql, 
  SiTailwindcss, SiVuedotjs, SiAngular, SiPhp, SiLaravel,
  SiGraphql, SiRedis, SiFirebase
} from 'react-icons/si';
import { useState, useEffect } from 'react';

interface ScoreData {
  globalScore: number;
  githubScore: number;
  contributions: {
    posts: number;
    comments: number;
    likesReceived: number;
    technologies: number;
    skills: number;
  };
  technologyScores: Record<string, number>;
}

// Mapping des technologies vers leurs icônes
const getTechIcon = (tech: string) => {
  const techLower = tech.toLowerCase();
  
  // React & Frameworks
  if (techLower.includes('react')) return <SiReact className="w-4 h-4 text-cyan-400" />;
  if (techLower.includes('next')) return <SiNextdotjs className="w-4 h-4 text-white" />;
  if (techLower.includes('vue')) return <SiVuedotjs className="w-4 h-4 text-green-500" />;
  if (techLower.includes('angular')) return <SiAngular className="w-4 h-4 text-red-500" />;
  
  // Langages
  if (techLower.includes('typescript')) return <SiTypescript className="w-4 h-4 text-blue-500" />;
  if (techLower.includes('javascript')) return <SiJavascript className="w-4 h-4 text-yellow-400" />;
  if (techLower.includes('python')) return <SiPython className="w-4 h-4 text-yellow-500" />;
  if (techLower.includes('php')) return <SiPhp className="w-4 h-4 text-purple-400" />;
  
  // Backend
  if (techLower.includes('node')) return <SiNodedotjs className="w-4 h-4 text-green-500" />;
  if (techLower.includes('laravel')) return <SiLaravel className="w-4 h-4 text-red-400" />;
  if (techLower.includes('graphql')) return <SiGraphql className="w-4 h-4 text-pink-500" />;
  
  // Base de données
  if (techLower.includes('mongodb')) return <SiMongodb className="w-4 h-4 text-green-500" />;
  if (techLower.includes('postgresql')) return <SiPostgresql className="w-4 h-4 text-blue-400" />;
  if (techLower.includes('redis')) return <SiRedis className="w-4 h-4 text-red-500" />;
  
  // DevOps & Cloud
  if (techLower.includes('docker')) return <SiDocker className="w-4 h-4 text-blue-400" />;
  if (techLower.includes('kubernetes')) return <SiKubernetes className="w-4 h-4 text-blue-400" />;
  if (techLower.includes('aws')) return <FaAws className="w-4 h-4 text-orange-400" />;
  if (techLower.includes('firebase')) return <SiFirebase className="w-4 h-4 text-yellow-500" />;
  
  // CSS
  if (techLower.includes('tailwind')) return <SiTailwindcss className="w-4 h-4 text-cyan-400" />;
  
  return <FaLaptopCode className="w-4 h-4 text-gray-400" />;
};

export default function ScoreCard({ email }: { email: string }) {
  const [score, setScore] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch(`/api/score/${encodeURIComponent(email)}`);
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
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Analyse des compétences...</span>
        </div>
      </div>
    );
  }

  if (!score) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-400';
    if (score >= 60) return 'bg-amber-400';
    if (score >= 40) return 'bg-orange-400';
    return 'bg-rose-400';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { icon: <FaTrophy className="w-5 h-5" />, text: 'Expert', color: 'text-emerald-400' };
    if (score >= 60) return { icon: <FaStar className="w-5 h-5" />, text: 'Avancé', color: 'text-amber-400' };
    if (score >= 40) return { icon: <FaUserGraduate className="w-5 h-5" />, text: 'Intermédiaire', color: 'text-orange-400' };
    return { icon: <FaSeedling className="w-5 h-5" />, text: 'Débutant', color: 'text-rose-400' };
  };

  const level = getScoreLevel(score.globalScore);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      {/* En-tête */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-4 py-2 mb-4">
          <FaBrain className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Compétences techniques</span>
        </div>
        
        <div className="relative inline-block">
          {/* Cercle de progression */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray="364.4"
                strokeDashoffset={364.4 * (1 - score.globalScore / 100)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{score.globalScore}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={level.color}>{level.icon}</span>
            <span className={`font-semibold ${level.color}`}>{level.text}</span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-2 text-center border border-gray-700">
          <FaCode className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{score.contributions.posts}</div>
          <div className="text-xs text-gray-400">Posts</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-2 text-center border border-gray-700">
          <FaComments className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{score.contributions.comments}</div>
          <div className="text-xs text-gray-400">Commentaires</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-2 text-center border border-gray-700">
          <FaHeart className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{score.contributions.likesReceived}</div>
          <div className="text-xs text-gray-400">Likes</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-2 text-center border border-gray-700">
          <FaGitAlt className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{score.githubScore}%</div>
          <div className="text-xs text-gray-400">GitHub</div>
        </div>
      </div>

      {/* Scores par technologie */}
      {Object.keys(score.technologyScores).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaRocket className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-300">Maîtrise technologique</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(score.technologyScores).map(([tech, techScore]) => (
              <div key={tech}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    {getTechIcon(tech)}
                    <span className="text-sm text-gray-300">{tech}</span>
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(techScore)}`}>
                    {techScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${getScoreBg(techScore)}`}
                    style={{ width: `${techScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge final */}
      {score.globalScore >= 70 && (
        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full px-4 py-2">
            <FaClipboardCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400">Compétences vérifiées</span>
            <FaShieldAlt className="w-3 h-3 text-amber-400" />
          </div>
        </div>
      )}
    </div>
  );
}