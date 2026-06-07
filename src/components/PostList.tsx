'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, User, Calendar, MessageCircle } from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    if (res.ok) {
      fetchPosts();
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return (
    <div className="text-center py-8 text-gray-500">
      Chargement des posts...
    </div>
  );

  if (posts.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      <MessageCircle className="mx-auto mb-2" size={32} />
      Aucun post pour le moment. Sois le premier à publier !
    </div>
  );

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
          <p className="text-gray-700 mb-4">{post.content}</p>
          
          <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{post.authorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            
            <button
              onClick={() => handleLike(post._id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                post.likedBy.includes(session?.user?.email || '')
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Heart size={16} fill={post.likedBy.includes(session?.user?.email || '') ? 'white' : 'none'} />
              <span>{post.likes}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}