'use client';

import { FaHeart, FaRegHeart, FaUser, FaCalendar } from 'react-icons/fa';
import { useState } from 'react';

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    authorName: string;
    likes: number;
    likedBy: string[];
    createdAt: string;
  };
  userId: string;
  onLike: (id: string) => void;
}

export default function PostCard({ post, userId, onLike }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isLiked = post.likedBy.includes(userId);

  return (
    <div 
      className="post-card bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {post.content}
        </p>
        
        <div className="flex flex-wrap justify-between items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FaUser className="w-3.5 h-3.5" />
              <span className="font-medium">{post.authorName}</span>
            </div>
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
      </div>
    </div>
  );
}