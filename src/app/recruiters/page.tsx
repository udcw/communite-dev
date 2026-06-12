'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaCode, FaStar, FaUser, FaEnvelope, FaHome } from 'react-icons/fa';

interface Candidate {
  _id: string;
  name: string;
  title?: string;
  location?: string;
  technologies: string[];
  skills: string[];
  githubUsername?: string;
  email: string;
  estimatedScore: number;
  profileUrl: string;
}

export default function RecruitersPage() {
  const router = useRouter();
  const [technology, setTechnology] = useState('');
  const [location, setLocation] = useState('');
  const [minScore, setMinScore] = useState(50);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    const params = new URLSearchParams();
    if (technology) params.append('technology', technology);
    if (location) params.append('location', location);
    if (minScore) params.append('minScore', minScore.toString());
    
    const res = await fetch(`/api/recruiters/search?${params.toString()}`);
    const data = await res.json();
    setCandidates(data.candidates || []);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Bouton retour à l'accueil */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-0 left-0 flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition text-sm"
      >
        <FaHome className="w-4 h-4" />
        Accueil
      </button>

      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Espace Recruteur
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trouvez les meilleurs talents technologiques
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaCode className="inline mr-2 w-4 h-4" />
                Technologie
              </label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="Ex: React, Docker, TypeScript..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaMapMarkerAlt className="inline mr-2 w-4 h-4" />
                Localisation
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Douala, Yaoundé, Paris..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaStar className="inline mr-2 w-4 h-4" />
                Score minimum
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className={`w-12 text-center font-bold ${getScoreColor(minScore)}`}>
                  {minScore}%
                </span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <FaSearch /> Rechercher des profils
          </button>
        </form>
      </div>

      {/* Résultats */}
      {searched && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {loading ? 'Recherche en cours...' : `${candidates.length} candidat(s) trouvé(s)`}
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border">
              <p className="text-gray-500">Aucun candidat trouvé</p>
              <p className="text-sm text-gray-400 mt-1">Modifiez vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {candidate.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getScoreBg(candidate.estimatedScore)}`}>
                          Score: {candidate.estimatedScore}%
                        </span>
                      </div>
                      
                      {candidate.title && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          {candidate.title}
                        </p>
                      )}
                      
                      {candidate.location && (
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                          <FaMapMarkerAlt className="w-3 h-3" /> {candidate.location}
                        </p>
                      )}
                      
                      {candidate.technologies && candidate.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {candidate.technologies.slice(0, 5).map((tech) => (
                            <span key={tech} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs">
                              {tech}
                            </span>
                          ))}
                          {candidate.technologies.length > 5 && (
                            <span className="text-xs text-gray-400">+{candidate.technologies.length - 5}</span>
                          )}
                        </div>
                      )}
                      
                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {candidate.skills.slice(0, 5).map((skill) => (
                            <span key={skill} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <a
                        href={candidate.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
                      >
                        <FaUser className="w-4 h-4" />
                        Voir le profil
                      </a>
                      <a
                        href={`mailto:${candidate.email}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        <FaEnvelope className="w-4 h-4" />
                        Contacter
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}