'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaUsers, FaFileAlt, FaComments, FaFlag, FaEye, FaTrash, FaUserCog } from 'react-icons/fa';

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
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'posts'>('dashboard');

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (session && session.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setRecentPosts(statsData.recentPosts);

        const usersRes = await fetch('/api/admin/users');
        const usersData = await usersRes.json();
        setUsers(usersData);
      } catch (error) {
        console.error('Erreur:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole })
    });
    // Rafraîchir
    const usersRes = await fetch('/api/admin/users');
    const usersData = await usersRes.json();
    setUsers(usersData);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Supprimer ce post ?')) {
      await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      // Rafraîchir
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setRecentPosts(statsData.recentPosts);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  if (!session) {
    return <div className="text-center py-20">Veuillez vous connecter</div>;
  }

  if (session.user?.role !== 'admin') {
    return <div className="text-center py-20">Accès refusé</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard Admin</h1>

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
          Utilisateurs
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm">Nom</th>
                <th className="px-4 py-2 text-left text-sm">Email</th>
                <th className="px-4 py-2 text-left text-sm">Rôle</th>
                <th className="px-4 py-2 text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-2 text-sm">{user.name}</td>
                  <td className="px-4 py-2 text-sm">{user.email}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      <FaUserCog className="inline mr-1" />
                      {user.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {recentPosts.map((post) => (
            <div key={post._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border flex justify-between items-center">
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-gray-500">par {post.authorName}</p>
              </div>
              <button
                onClick={() => handleDeletePost(post._id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}