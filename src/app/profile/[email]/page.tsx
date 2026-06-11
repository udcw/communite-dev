'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaCalendar, FaHeart, FaComment, FaFileAlt, FaArrowLeft, FaGithub, FaLinkedin, FaGlobe, FaCode } from 'react-icons/fa';
import PostCard from '@/components/PostCard';
import EditProfileModal from '@/components/profile/EditProfileModal';

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

interface Comment {
  _id: string;
  content: string;
  authorName: string;
  createdAt: string;
  postId: string;
}

interface Stats {
  postCount: number;
  commentCount: number;
  totalLikes: number;
  memberSince: string;
}

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  technologies?: string[];
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export default function ProfilePage() {
  const { email } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const decodedEmail = decodeURIComponent(email as string);
  const isOwnProfile = session?.user?.email === decodedEmail;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      // Récupérer le profil utilisateur
      const profileRes = await fetch(`/api/user/profile?email=${encodeURIComponent(decodedEmail)}`);
      const profileData = await profileRes.json();
      setUserProfile(profileData);
      
      // Récupérer les posts
      const postsRes = await fetch(`/api/users/${encodeURIComponent(decodedEmail)}/posts`);
      const postsData = await postsRes.json();
      setPosts(postsData);
      
      // Récupérer les stats
      const statsRes = await fetch(`/api/users/${encodeURIComponent(decodedEmail)}/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);
      
      // Récupérer les commentaires
      const commentsRes = await fetch(`/api/users/${encodeURIComponent(decodedEmail)}/comments`);
      const commentsData = await commentsRes.json();
      setComments(commentsData);
      
      setLoading(false);
    };
    
    if (decodedEmail) fetchUserData();
  }, [decodedEmail]);

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    const postsRes = await fetch(`/api/users/${encodeURIComponent(decodedEmail)}/posts`);
    const postsData = await postsRes.json();
    setPosts(postsData);
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
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
      >
        <FaArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col items-center -mt-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
              <FaUser className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mt-3">{userProfile?.name || 'Utilisateur'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <FaEnvelope className="w-3 h-3 text-gray-400" />
              <p className="text-sm text-gray-500">{decodedEmail}</p>
            </div>
            
            {/* Bio */}
            {userProfile?.bio && (
              <p className="text-center text-gray-600 dark:text-gray-400 mt-3 max-w-md">
                {userProfile.bio}
              </p>
            )}
            
            {/* Liens sociaux */}
            <div className="flex gap-3 mt-3">
              {userProfile?.githubUsername && (
                <a href={`https://github.com/${userProfile.githubUsername}`} target="_blank" rel="noopener noreferrer" 
                   className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                  <FaGithub className="w-5 h-5" />
                </a>
              )}
              {userProfile?.linkedinUrl && (
                <a href={userProfile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                   className="text-gray-600 hover:text-blue-600 dark:text-gray-400 transition">
                  <FaLinkedin className="w-5 h-5" />
                </a>
              )}
              {userProfile?.portfolioUrl && (
                <a href={userProfile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                   className="text-gray-600 hover:text-green-600 dark:text-gray-400 transition">
                  <FaGlobe className="w-5 h-5" />
                </a>
              )}
            </div>
            
            {/* Bouton modifier profil */}
            {isOwnProfile && (
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Modifier mon profil
              </button>
            )}
          </div>

          {/* Compétences */}
          {userProfile?.skills && userProfile.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <FaCode className="w-4 h-4" /> Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills.map((skill) => (
                  <span key={skill} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technologies */}
          {userProfile?.technologies && userProfile.technologies.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Technologies maîtrisées</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.technologies.map((tech) => (
                  <span key={tech} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <FaFileAlt className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.postCount || 0}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <FaHeart className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.totalLikes || 0}</p>
              <p className="text-xs text-gray-500">Likes reçus</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <FaComment className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.commentCount || 0}</p>
              <p className="text-xs text-gray-500">Commentaires</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 mt-4 text-xs text-gray-400">
            <FaCalendar className="w-3 h-3" />
            <span>Membre depuis {new Date(stats?.memberSince || new Date()).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 font-medium text-sm transition-all ${
            activeTab === 'posts'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Posts ({stats?.postCount || 0})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-medium text-sm transition-all ${
            activeTab === 'comments'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Commentaires ({stats?.commentCount || 0})
        </button>
      </div>

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
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
      )}

      {activeTab === 'comments' && (
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaComment className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Aucun commentaire</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <FaCalendar className="w-3 h-3" />
                  <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal d'édition du profil */}
      {showEditModal && (
        <EditProfileModal
          user={userProfile}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => window.location.reload()}
        />
      )}
    </div>
  );
}