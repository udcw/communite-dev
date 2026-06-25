'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageCircle, Send, Loader2, Image as ImageIcon, Heart, MessageSquare, Zap, Shield, CheckCircle, Users, Star } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import PostCard from '@/components/PostCard';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

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
  const heroRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // Effet parallax au scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        setOffset(scrollY * 0.3);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
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
      <div className="min-h-screen overflow-x-hidden">
        {/* Hero Section avec effet parallax */}
        <div 
          ref={heroRef}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl mb-16 transition-transform duration-300"
          style={{ transform: `translateY(${offset * 0.5}px)` }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div 
            className="absolute top-0 left-0 w-full h-full overflow-hidden"
            style={{ transform: `translateY(${offset * 0.2}px)` }}
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div 
            className="relative px-6 py-20 md:py-28 text-center"
            style={{ transform: `translateY(${offset * 0.1}px)` }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6 animate-bounce">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">Plus de 100 développeurs actifs</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
              La communauté des
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                développeurs passionnés
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Partagez vos projets, prouvez vos compétences, et connectez-vous avec les meilleurs talents tech.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => signIn('github')}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <FaGithub className="w-6 h-6" />
                Commencer gratuitement
                <span className="group-hover:translate-x-1 transition">→</span>
              </button>
              <button
                onClick={() => signIn('github')}
                className="inline-flex items-center gap-2 px-6 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg hover:bg-white/30 transition border border-white/30"
              >
                Voir les profils
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-white/80 text-sm">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> 100% gratuit</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Connexion sécurisée</span>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Score de compétence</span>
            </div>
          </div>
        </div>

        {/* Étapes pour être visible */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comment être visible sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Communauté Dev</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Suis ces 4 étapes simples pour créer un profil qui attire les recruteurs
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 perspective-1000">
            {/* Étape 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                <FaGithub className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Connecte-toi</h3>
              <p className="text-gray-500 text-sm">Utilise ton compte GitHub pour t'inscrire en 2 minutes</p>
            </div>

            {/* Étape 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Complète ton profil</h3>
              <p className="text-gray-500 text-sm">Ajoute ton GitHub, compétences et technologies</p>
            </div>

            {/* Étape 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Publie des posts</h3>
              <p className="text-gray-500 text-sm">Partage ton expertise et montre tes compétences</p>
            </div>

            {/* Étape 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Sois actif</h3>
              <p className="text-gray-500 text-sm">Commente, like et interagis pour booster ton score</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => signIn('github')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
            >
              <FaGithub className="w-5 h-5" />
              Commencer maintenant
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-12 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="hover:scale-110 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-1">100+</div>
              <div className="text-sm text-gray-500">Développeurs actifs</div>
            </div>
            <div className="hover:scale-110 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-1">50+</div>
              <div className="text-sm text-gray-500">Posts partagés</div>
            </div>
            <div className="hover:scale-110 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-1">1k+</div>
              <div className="text-sm text-gray-500">Interactions</div>
            </div>
            <div className="hover:scale-110 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-1">24/7</div>
              <div className="text-sm text-gray-500">Communauté active</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Prêt à faire décoller ta carrière ?
          </h2>
          <p className="text-white/80 text-base md:text-lg mb-6 max-w-md mx-auto">
            Rejoins une communauté de développeurs qui prouvent leurs compétences
          </p>
          <button
            onClick={() => signIn('github')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
          >
            <FaGithub className="w-5 h-5" />
            S'inscrire gratuitement
          </button>
          <p className="text-white/60 text-xs mt-4 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Gratuit</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Sécurisé</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 2 minutes</span>
          </p>
        </div>
      </div>
    );
  }

  // PAGE POUR UTILISATEURS CONNECTÉS
  return (
    <div className="px-0">
      <div className="space-y-6">
        {/* Section de bienvenue avec logo */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-1.5 rounded-full">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="text-xs text-gray-500">Connecté en tant que</p>
                <p className="font-semibold text-base">{session.user?.name}</p>
              </div>
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