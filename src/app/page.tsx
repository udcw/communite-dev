'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface Post {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les posts
  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
  };

  // Créer un post
  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    setTitle('');
    setContent('');
    setLoading(false);
    fetchPosts();
  };

  // Liker un post
  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    fetchPosts();
  };

  useEffect(() => {
    if (session) fetchPosts();
  }, [session]);

  if (!session) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur Communauté Dev</h1>
        <p className="text-xl text-gray-600">
          Connecte-toi avec GitHub pour rejoindre la communauté 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Communauté Dev</h1>
        <p className="text-gray-600">Content de te revoir {session.user?.name} !</p>
      </div>

      {/* Formulaire de création */}
      <form onSubmit={createPost} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Nouveau post</h2>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />
        <textarea
          placeholder="Contenu"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          rows={4}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Publication...' : 'Publier'}
        </button>
      </form>

      {/* Liste des posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500">Aucun post pour le moment. Sois le premier à publier !</div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
              <p className="text-gray-700 mb-4">{post.content}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Par {post.authorName}</span>
                <button
                  onClick={() => handleLike(post._id)}
                  className={`px-3 py-1 rounded ${post.likedBy.includes(session.user?.email || '') ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                >
                  ❤️ {post.likes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}