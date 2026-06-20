'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ScoreCard from '@/components/ScoreCard';
import { FaUser, FaEnvelope, FaArrowLeft, FaFileAlt, FaMapMarkerAlt, FaBriefcase, FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';
import PostCard from '@/components/PostCard';
import GitHubProjects from '@/components/GitHubProjects';

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

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  technologies?: string[];
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  title?: string;
  company?: string;
  location?: string;
}

export default function ProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const email = typeof id === 'string' ? decodeURIComponent(id) : '';
  const isOwnProfile = session?.user?.email === email;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer le profil utilisateur
        const profileRes = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
        const profileData = await profileRes.json();
        setUserProfile(profileData);

        // Récupérer les posts
        const postsRes = await fetch(`/api/users/${encodeURIComponent(email)}/posts`);
        const postsData = await postsRes.json();

        if (Array.isArray(postsData)) {
          setPosts(postsData);
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
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaUser className="w-10 h-10 text-white" />
          </div>

          {/* Nom */}
          <h1 className="text-2xl font-bold mt-3">{userProfile?.name || 'Utilisateur'}</h1>

          {/* Titre professionnel */}
          {userProfile?.title && (
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-1">
              {userProfile.title}
            </p>
          )}

          {/* Entreprise */}
          {userProfile?.company && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <FaBriefcase className="w-3 h-3" /> {userProfile.company}
            </p>
          )}

          {/* Localisation */}
          {userProfile?.location && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
              <FaMapMarkerAlt className="w-3 h-3" /> {userProfile.location}
            </p>
          )}

          {/* Email */}
          <div className="flex items-center gap-2 mt-2">
            <FaEnvelope className="w-3 h-3 text-gray-400" />
            <p className="text-sm text-gray-500">{userProfile?.email || email}</p>
          </div>

          {/* Liens sociaux - GitHub, LinkedIn, Portfolio */}
          <div className="flex gap-4 mt-3">
            {userProfile?.githubUsername && (
              <a
                href={`https://github.com/${userProfile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition flex items-center gap-1 text-sm"
              >
                <FaGithub className="w-4 h-4" />
                GitHub
              </a>
            )}
            {userProfile?.linkedinUrl && (
              <a
                href={userProfile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 transition flex items-center gap-1 text-sm"
              >
                <FaLinkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}
            {userProfile?.portfolioUrl && (
              <a
                href={userProfile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 dark:text-gray-400 transition flex items-center gap-1 text-sm"
              >
                <FaGlobe className="w-4 h-4" />
                Portfolio
              </a>
            )}
          </div>

          {/* Badge "C'est vous" et bouton Modifier (uniquement pour le propriétaire) */}
          {isOwnProfile && (
            <div className="flex flex-col items-center gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                C'est vous
              </span>
              <button
                onClick={() => router.push('/profile/edit')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Modifier mon profil
              </button>
            </div>
          )}

          {/* Bouton Envoyer un message - visible pour tous sauf soi-même */}
          {!isOwnProfile && userProfile?.email && (
            <button
              onClick={() => router.push(`/messages?to=${encodeURIComponent(email)}`)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FaEnvelope className="w-4 h-4" />
              Envoyer un message
            </button>
          )}
        </div>

        {/* Bio */}
        {userProfile?.bio && (
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 italic">"{userProfile.bio}"</p>
          </div>
        )}

        {/* Compétences */}
        {userProfile?.skills && userProfile.skills.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">Compétences</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {userProfile.skills.map((skill) => (
                <span key={skill} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Technologies maîtrisées */}
        {userProfile?.technologies && userProfile.technologies.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">Technologies maîtrisées</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {userProfile.technologies.map((tech) => (
                <span key={tech} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projets GitHub */}
        {userProfile?.githubUsername && (
          <div className="mt-6">
            <GitHubProjects username={userProfile.githubUsername} />
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <FaFileAlt className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{posts.length}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
        </div>

        {/* Score de compétence - UNIQUEMENT pour le propriétaire */}
        {isOwnProfile && (
          <div className="mt-6">
            <ScoreCard email={email} />
          </div>
        )}
      </div>

      {/* Liste des posts */}
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