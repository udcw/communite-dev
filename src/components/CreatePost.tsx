'use client';

import { useState } from 'react';
import { Send, FileText, Type } from 'lucide-react';

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      setTitle('');
      setContent('');
      onPostCreated();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileText size={20} />
        Nouveau post
      </h2>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Type size={16} />
          Titre
        </label>
        <input
          type="text"
          placeholder="Titre du post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contenu
        </label>
        <textarea
          placeholder="Écris ton post ici..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        <Send size={16} />
        {loading ? 'Publication...' : 'Publier'}
      </button>
    </form>
  );
}