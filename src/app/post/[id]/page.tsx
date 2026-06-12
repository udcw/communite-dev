'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import PostCard from '@/components/PostCard';
import { useSession } from 'next-auth/react';

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      setPost(data);
      setLoading(false);
    };
    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  if (!post) {
    return <div className="text-center py-20">Post non trouvé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-700"
      >
        <FaArrowLeft /> Retour
      </button>
      <PostCard
        post={post}
        userId={session?.user?.email || ''}
        onLike={() => {}}
      />
    </div>
  );
}