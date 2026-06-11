'use client';

import { useState } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import ImageUpload from './ImageUpload';

interface EditPostModalProps {
  post: {
    _id: string;
    title: string;
    content: string;
    imageUrl?: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditPostModal({ post, onClose, onUpdate }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch(`/api/posts/${post._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, imageUrl }),
    });
    
    if (res.ok) {
      onUpdate();
      onClose();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce post ?')) return;
    
    setDeleting(true);
    await fetch(`/api/posts/${post._id}`, { method: 'DELETE' });
    onUpdate();
    onClose();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Modifier le post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleUpdate} className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Contenu"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px]"
            required
          />
          
          <ImageUpload
            onImageUpload={setImageUrl}
            onRemove={() => setImageUrl('')}
            currentImage={imageUrl}
          />
          
          <div className="flex justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <FaTrash className="w-4 h-4" />
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <FaSave className="w-4 h-4" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}