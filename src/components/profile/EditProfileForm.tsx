'use client';

import { useState } from 'react';
import { FaGithub, FaLinkedin, FaGlobe, FaFilePdf, FaPlus, FaTimes } from 'react-icons/fa';

interface EditProfileFormProps {
  user: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProfileForm({ user, onClose, onUpdate }: EditProfileFormProps) {
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
    
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, skills, technologies, githubUsername, linkedinUrl, portfolioUrl })
    });
    
    setLoading(false);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Modifier mon profil</h2>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Développeur passionné..."
            />
          </div>
          
          {/* Compétences */}
          <div>
            <label className="block text-sm font-medium mb-1">Compétences</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}><FaTimes className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Ex: React, Node.js..."
              />
              <button type="button" onClick={addSkill} className="px-4 py-2 bg-gray-100 rounded-lg">+</button>
            </div>
          </div>
          
          {/* Technologies maîtrisées */}
          <div>
            <label className="block text-sm font-medium mb-1">Technologies</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {technologies.map(tech => (
                <span key={tech} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)}><FaTimes className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Ex: Docker, TypeScript..."
              />
              <button type="button" onClick={addTech} className="px-4 py-2 bg-gray-100 rounded-lg">+</button>
            </div>
          </div>
          
          {/* GitHub Username */}
          <div>
            <label className="block text-sm font-medium mb-1">GitHub (username)</label>
            <div className="flex items-center gap-2">
              <FaGithub className="text-gray-500" />
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
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
                className="flex-1 px-3 py-2 border rounded-lg"
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
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}