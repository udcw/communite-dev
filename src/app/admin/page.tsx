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

interface Report {
  _id: string;
  postId: string;
  postTitle: string;
  postAuthor: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'posts' | 'reports'>('dashboard');

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
        // Stats
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setRecentPosts(statsData.recentPosts || []);

        // Users
        const usersRes = await fetch('/api/admin/users');
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);

        // Reports
        const reportsRes = await fetch('/api/admin/reports');
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
        
        // Mettre à jour pendingReports dans stats
        if (statsData.stats) {
          setStats(prev => ({
            ...prev!,
            pendingReports: reportsData.pendingCount || 0
          }));
        }
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

  const handleReportAction = async (reportId: string, status: string, action: string | null) => {
    await fetch('/api/admin/reports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status, action })
    });
    // Rafraîchir
    const reportsRes = await fetch('/api/admin/reports');
    const reportsData = await reportsRes.json();
    setReports(reportsData.reports || []);
  };

  if (status === 'loading' || loading) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length;

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
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-sm text-gray-500">En attente</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Utilisateurs ({stats?.totalUsers || 0})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 whitespace-nowrap ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Posts récents
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 whitespace-nowrap ${activeTab === 'reports' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Signalements ({pendingCount})
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

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun signalement</p>
          ) : (
            reports.map((report) => (
              <div key={report._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{report.postTitle}</p>
                    <p className="text-sm text-gray-500">par {report.postAuthor}</p>
                    <p className="text-sm text-gray-400">Signalé par {report.reportedBy}</p>
                    <p className="text-sm text-gray-400">Raison : {report.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReportAction(report._id, 'resolved', 'delete')}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition flex items-center gap-1"
                        >
                          <FaTrash className="w-3 h-3" />
                          Supprimer le post
                        </button>
                        <button
                          onClick={() => handleReportAction(report._id, 'rejected', null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition flex items-center gap-1"
                        >
                          <FaTimesCircle className="w-3 h-3" />
                          Rejeter
                        </button>
                      </>
                    )}
                    {report.status === 'resolved' && (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3" />
                        Résolu
                      </span>
                    )}
                    {report.status === 'rejected' && (
                      <span className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm flex items-center gap-1">
                        <FaTimesCircle className="w-3 h-3" />
                        Rejeté
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}