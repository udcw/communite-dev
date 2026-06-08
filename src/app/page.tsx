'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Send, Loader2, Image as ImageIcon } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import PostCard from '@/components/PostCard';
import ImageUpload from '@/components/ImageUpload';

interface Post {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  imageUrl?: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setSubmitting(true);
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, imageUrl }),
    });
    setTitle('');
    setContent('');
    setImageUrl('');
    setSubmitting(false);
    fetchPosts();
  };

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Bienvenue sur Communauté Dev
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Rejoins une communauté de développeurs passionnés
        </p>
        <button
          onClick={() => signIn('github')}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <FaGithub className="w-5 h-5" />
          Se connecter avec GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section de bienvenue */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-full">
            <span className="text-white text-sm">✓</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Connecté en tant que</p>
            <p className="font-semibold text-lg">{session.user?.name}</p>
          </div>
        </div>
      </div>

      {/* Formulaire de création avec image */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Créer une publication
          </h2>
        </div>
        <form onSubmit={createPost} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Titre de votre publication"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
            required
          />
          <textarea
            placeholder="Partagez votre idée, question ou découverte..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
            rows={4}
            required
          />
          
          {/* Upload d'image */}
          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Ajouter une image (optionnel)</span>
            </div>
            <ImageUpload 
              onImageUpload={setImageUrl}
              onRemove={() => setImageUrl('')}
              currentImage={imageUrl}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des posts avec images */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun post pour le moment.</p>
            <p className="text-sm text-gray-400">Soyez le premier à publier !</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              userId={session.user?.email || ''}
              onLike={handleLike}
            />
          ))
        )}
      </div>
    </div>
  );
}