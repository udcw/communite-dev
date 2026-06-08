'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaComment, FaPaperPlane, FaUser } from 'react-icons/fa';

interface Comment {
  _id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    setComments(data);
    setLoading(false);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    setSubmitting(true);
    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment }),
    });
    setNewComment('');
    setSubmitting(false);
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <FaComment className="w-4 h-4 text-gray-400" />
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {comments.length} commentaire{comments.length > 1 ? 's' : ''}
        </h4>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aucun commentaire. Sois le premier !</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FaUser className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {comment.authorName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout */}
      {session ? (
        <form onSubmit={submitComment} className="flex gap-2">
          <input
            type="text"
            placeholder="Écrire un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-400 italic">Connecte-toi pour commenter</p>
      )}
    </div>
  );
}