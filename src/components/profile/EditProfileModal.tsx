'use client';

import { useState } from 'react';
import { FaTimes, FaSave, FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';

interface EditProfileModalProps {
  user: {
    name?: string;
    email?: string;
    bio?: string;
    skills?: string[];
    technologies?: string[];
    githubUsername?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  } | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProfileModal({ user, onClose, onUpdate }: EditProfileModalProps) {
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [technologies, setTechnologies] = useState<string[]>(user?.technologies || []);
  const [newTech, setNewTech] = useState('');
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addTech = () => {
    if (newTech && !technologies.includes(newTech)) {
      setTechnologies([...technologies, newTech]);
      setNewTech('');
    }
  };

  const removeTech = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        bio, 
        skills, 
        technologies, 
        githubUsername, 
        linkedinUrl, 
        portfolioUrl 
      }),
    });
    
    if (res.ok) {
      onUpdate();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Modifier mon profil</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
              rows={3}
              placeholder="Développeur passionné par..."
            />
          </div>
          
          {/* Compétences */}
          <div>
            <label className="block text-sm font-medium mb-1">Compétences</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map(skill => (
                <span key={skill} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-sm"
                placeholder="Ex: React, Node.js, Python..."
              />
              <button type="button" onClick={addSkill} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition">
                Ajouter
              </button>
            </div>
          </div>
          
          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium mb-1">Technologies maîtrisées</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {technologies.map(tech => (
                <span key={tech} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-500">
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-sm"
                placeholder="Ex: Docker, Kubernetes, AWS..."
              />
              <button type="button" onClick={addTech} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition">
                Ajouter
              </button>
            </div>
          </div>
          
          {/* GitHub */}
          <div>
            <label className="block text-sm font-medium mb-1">GitHub (username)</label>
            <div className="flex items-center gap-2">
              <FaGithub className="text-gray-500" />
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                placeholder="ex: jordanfokou"
              />
            </div>
          </div>
          
          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn</label>
            <div className="flex items-center gap-2">
              <FaLinkedin className="text-blue-600" />
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
          
          {/* Portfolio */}
          <div>
            <label className="block text-sm font-medium mb-1">Portfolio / Site web</label>
            <div className="flex items-center gap-2">
              <FaGlobe className="text-green-600" />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                placeholder="https://monportfolio.com"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 transition">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              <FaSave className="w-4 h-4" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}