'use client';

import { FaHeart, FaRegHeart, FaUser, FaCalendar, FaComment, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CommentSection from './CommentSection';
import EditPostModal from './EditPostModal';

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    authorName: string;
    authorEmail: string;
    likes: number;
    likedBy: string[];
    createdAt: string;
    imageUrl?: string;
  };
  userId: string;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
}

export default function PostCard({ post, userId, onLike, onDelete, onUpdate }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();
  
  const isLiked = post.likedBy.includes(userId);
  const isAuthor = userId === post.authorEmail;

  const goToProfile = () => {
    router.push(`/profile/${encodeURIComponent(post.authorEmail)}`);
  };

  const handleDelete = async () => {
    if (confirm('Supprimer ce post ?')) {
      const res = await fetch(`/api/posts/${post._id}`, { method: 'DELETE' });
      if (res.ok) {
        if (onDelete) onDelete(post._id);
        if (onUpdate) onUpdate();
        window.location.reload();
      }
    }
  };

  return (
    <>
      <div
        className="post-card bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6">
          {/* En-tête avec titre et menu */}
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 flex-1">
              {post.title}
            </h3>
            
            {/* Menu à 3 points (visible uniquement pour l'auteur) */}
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                >
                  <FaEllipsisV className="w-4 h-4 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowEditModal(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <FaEdit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleDelete();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <FaTrash className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Image du post (si présente) */}
          {post.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full max-h-96 object-cover rounded-lg"
              />
            </div>
          )}
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {post.content}
          </p>

          <div className="flex flex-wrap justify-between items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <button
                onClick={goToProfile}
                className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
              >
                <FaUser className="w-3.5 h-3.5" />
                <span className="font-medium">{post.authorName}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <FaCalendar className="w-3.5 h-3.5" />
                <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            <button
              onClick={() => onLike(post._id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                isLiked
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${isHovered && !isLiked ? 'scale-105' : ''}`}
            >
              {isLiked ? <FaHeart className="w-3.5 h-3.5" /> : <FaRegHeart className="w-3.5 h-3.5" />}
              <span className="font-medium">{post.likes}</span>
            </button>
          </div>

          {/* Section commentaires */}
          <div className="mt-4">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <FaComment className="w-3.5 h-3.5" />
              <span>Commentaires</span>
            </button>

            {showComments && <CommentSection postId={post._id} />}
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            if (onUpdate) onUpdate();
            window.location.reload();
          }}
        />
      )}
    </>
  );
}