'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  FaUsers, FaFileAlt, FaComments, FaFlag, FaEye, 
  FaTrash, FaUserCog, FaHome, FaShieldAlt, FaUser, 
  FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalReports: number;
  pendingReports: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  authorName: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'posts'>('dashboard');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    if (session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setRecentPosts(statsData.recentPosts || []);

        const usersRes = await fetch('/api/admin/users');
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error('Erreur:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [session, status, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole })
    });
    const usersRes = await fetch('/api/admin/users');
    const usersData = await usersRes.json();
    setUsers(Array.isArray(usersData) ? usersData : []);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Supprimer ce post ?')) {
      await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setRecentPosts(statsData.recentPosts || []);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* En-tête avec bouton retour */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition border border-gray-200 dark:border-gray-700"
        >
          <FaHome className="w-4 h-4" />
          Retour à l'accueil
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaUsers className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-gray-500">Utilisateurs</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaFileAlt className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
          <p className="text-sm text-gray-500">Posts</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaComments className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalComments || 0}</p>
          <p className="text-sm text-gray-500">Commentaires</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaFlag className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalReports || 0}</p>
          <p className="text-sm text-gray-500">Signalements</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaEye className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.pendingReports || 0}</p>
          <p className="text-sm text-gray-500">En attente</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Utilisateurs ({stats?.totalUsers || 0})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Posts récents
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-x-auto">
          {users.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucun utilisateur trouvé</p>
          ) : (
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rôle</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="px-4 py-3 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FaShieldAlt className="inline mr-1 w-3 h-3" />
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                          user.role === 'admin'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {user.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {recentPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun post</p>
          ) : (
            recentPosts.map((post) => (
              <div key={post._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border flex justify-between items-center">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-gray-500">par {post.authorName}</p>
                </div>
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition flex items-center gap-1"
                >
                  <FaTrash className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}