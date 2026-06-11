'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Send, Loader2, Image as ImageIcon, Heart, MessageSquare, Zap, Shield } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import PostCard from '@/components/PostCard';
import ImageUpload from '@/components/ImageUpload';

interface Post {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      // Vérifie que data est un tableau
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error('L\'API n\'a pas retourné un tableau:', data);
        setPosts([]);
      }
    } catch (error) {
      console.error('Erreur fetchPosts:', error);
      setPosts([]);
    }
    setLoading(false);
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setSubmitting(true);
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imageUrl }),
      });
      setTitle('');
      setContent('');
      setImageUrl('');
      await fetchPosts();
    } catch (error) {
      console.error('Erreur création post:', error);
    }
    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      await fetchPosts();
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // LANDING PAGE POUR VISITEURS NON CONNECTÉS
  if (!session) {
    return (
      <div className="min-h-screen px-0">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 mb-12 shadow-2xl -mx-4 md:-mx-6 rounded-none md:rounded-3xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative px-4 py-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">Plus de 100 développeurs actifs</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 px-2">
              La communauté des
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                développeurs passionnés
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto px-4">
              Partagez vos projets, posez vos questions, et grandissez ensemble.
            </p>
            
            <button
              onClick={() => signIn('github')}
              className="group inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-gray-900 rounded-xl font-semibold text-base md:text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <FaGithub className="w-5 h-5 md:w-6 md:h-6" />
              Commencer gratuitement
              <span className="group-hover:translate-x-1 transition">→</span>
            </button>
            
            <p className="text-white/70 text-xs md:text-sm mt-4 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3 md:w-4 md:h-4" />
              Connexion sécurisée • 30 secondes
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12 px-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
              <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">Discussions enrichissantes</h3>
            <p className="text-gray-500 text-xs md:text-sm">Échangez avec des développeurs de tous niveaux</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
              <ImageIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">Partage d'images</h3>
            <p className="text-gray-500 text-xs md:text-sm">Illustrez vos posts avec des captures</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
              <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">Système de likes</h3>
            <p className="text-gray-500 text-xs md:text-sm">Valorisez les contributions de vos pairs</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 md:p-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div><div className="text-2xl md:text-3xl font-bold text-blue-600">500+</div><div className="text-xs md:text-sm text-gray-500">Membres actifs</div></div>
            <div><div className="text-2xl md:text-3xl font-bold text-purple-600">50+</div><div className="text-xs md:text-sm text-gray-500">Posts partagés</div></div>
            <div><div className="text-2xl md:text-3xl font-bold text-pink-600">1k+</div><div className="text-xs md:text-sm text-gray-500">Likes donnés</div></div>
            <div><div className="text-2xl md:text-3xl font-bold text-green-600">24/7</div><div className="text-xs md:text-sm text-gray-500">Communauté active</div></div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Prêt à rejoindre l'aventure ?</h2>
          <p className="text-white/80 text-sm md:text-base mb-6 max-w-md mx-auto">Rejoins des centaines de développeurs</p>
          <button onClick={() => signIn('github')} className="inline-flex items-center gap-2 px-5 py-2 md:px-6 md:py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm md:text-base hover:shadow-lg transition transform hover:scale-105">
            <FaGithub className="w-4 h-4 md:w-5 md:h-5" />
            S'inscrire avec GitHub
          </button>
        </div>
      </div>
    );
  }

  // PAGE POUR UTILISATEURS CONNECTÉS
  return (
    <div className="px-0">
      <div className="space-y-6">
        {/* Section de bienvenue */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-1.5 rounded-full">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Connecté en tant que</p>
              <p className="font-semibold text-base">{session.user?.name}</p>
            </div>
          </div>
        </div>

        {/* Formulaire de création */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Créer une publication
            </h2>
          </div>
          <form onSubmit={createPost} className="p-4 space-y-3">
            <input 
              type="text" 
              placeholder="Titre" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-sm" 
              required 
            />
            <textarea 
              placeholder="Partagez votre idée..." 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-sm" 
              rows={3} 
              required 
            />
            
            <ImageUpload onImageUpload={setImageUrl} onRemove={() => setImageUrl('')} currentImage={imageUrl} />

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting} 
                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {submitting ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </form>
        </div>

        {/* Liste des posts */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <MessageCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aucun post pour le moment</p>
              <p className="text-gray-400 text-xs">Soyez le premier à publier !</p>
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
    </div>
  );
}