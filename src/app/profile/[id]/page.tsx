'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaCalendar, FaHeart, FaComment, FaFileAlt, FaArrowLeft } from 'react-icons/fa';
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
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // id est déjà l'email ou l'identifiant
        const email = typeof id === 'string' ? id : '';
        
        const postsRes = await fetch(`/api/users/${encodeURIComponent(email)}/posts`);
        const postsData = await postsRes.json();
        setPosts(postsData);
        
        if (postsData.length > 0) {
          setUserInfo({
            name: postsData[0].authorName,
            email: postsData[0].authorEmail
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
      setLoading(false);
    };
    
    if (id) fetchUserData();
  }, [id]);

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    if (userInfo?.email) {
      const postsRes = await fetch(`/api/users/${encodeURIComponent(userInfo.email)}/posts`);
      const postsData = await postsRes.json();
      setPosts(postsData);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Utilisateur non trouvé</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-500">Retour</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 text-sm">
        <FaArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaUser className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mt-3">{userInfo.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <FaEnvelope className="w-3 h-3 text-gray-400" />
            <p className="text-sm text-gray-500">{userInfo.email}</p>
          </div>
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
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border">
            <p className="text-gray-500">Aucun post pour le moment</p>
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