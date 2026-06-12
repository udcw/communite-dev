'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

export default function EditProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    bio: '',
    skills: '',
    technologies: '',
    githubUsername: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setFormData({
        title: data.title || '',
        company: data.company || '',
        location: data.location || '',
        bio: data.bio || '',
        skills: data.skills?.join(', ') || '',
        technologies: data.technologies?.join(', ') || '',
        githubUsername: data.githubUsername || '',
        linkedinUrl: data.linkedinUrl || '',
        portfolioUrl: data.portfolioUrl || '',
      });
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
        githubUsername: formData.githubUsername,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
      }),
    });
    
    if (res.ok) {
      router.push(`/profile/${session?.user?.email}`);
    }
    setLoading(false);
  };

  if (!session) {
    return <div className="text-center py-20">Connectez-vous pour modifier votre profil</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500">
        <FaArrowLeft /> Retour
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-6">Modifier mon profil</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre professionnel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: Développeur Full-Stack Senior"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Entreprise</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: Google, Freelance"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Localisation</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: Douala, Cameroun"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Développeur passionné par..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Compétences (séparées par des virgules)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: React, Node.js, Python"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Technologies (séparées par des virgules)</label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({...formData, technologies: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: Docker, Kubernetes, AWS"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">GitHub (username)</label>
            <input
              type="text"
              value={formData.githubUsername}
              onChange={(e) => setFormData({...formData, githubUsername: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="ex: jordanfokou"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Portfolio / Site web</label>
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://monportfolio.com"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-lg">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}