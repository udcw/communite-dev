'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import PostCard from '@/components/PostCard';

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

export default function ProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // L'email est passé directement dans l'URL
  const email = typeof id === 'string' ? decodeURIComponent(id) : '';

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching posts for email:', email);
        const res = await fetch(`/api/users/${encodeURIComponent(email)}/posts`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setPosts(data);
          if (data.length > 0) {
            setUserName(data[0].authorName);
            setUserEmail(data[0].authorEmail);
          } else {
            setUserName(email.split('@')[0]);
            setUserEmail(email);
          }
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, [email]);

  const handleLike = async (postId: string) => {
    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      const res = await fetch(`/api/users/${encodeURIComponent(email)}/posts`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700"
      >
        <FaArrowLeft /> Retour
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaUser className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mt-3">{userName || 'Utilisateur'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <FaEnvelope className="w-3 h-3 text-gray-400" />
            <p className="text-sm text-gray-500">{userEmail || email}</p>
          </div>
          {session?.user?.email === email && (
            <span className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              C'est vous
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <FaFileAlt className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{posts.length}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Posts</h2>
        {posts.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border">
            <p className="text-gray-500">Aucun post</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              userId={session?.user?.email || ''}
              onLike={handleLike}
            />
          ))
        )}
      </div>
    </div>
  );
}