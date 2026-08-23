'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaChartLine,
  FaFileAlt,
  FaHeart,
  FaComment,
  FaTrophy,
  FaCalendar,
} from "react-icons/fa";
import ScoreBadge from "@/components/ScoreBadge";


interface Stats {
  posts: number;
  comments: number;
  likesReceived: number;
  score: number;
  applications: number;
  views: number;
}

interface ActivityItem {
  message: string;
  date: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="text-center py-20">
        Chargement de votre tableau de bord...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <span className="text-sm text-gray-500">
          Bienvenue {session?.user?.name} 
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaFileAlt className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.posts || 0}</p>
          <p className="text-sm text-gray-500">Posts</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaHeart className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.likesReceived || 0}</p>
          <p className="text-sm text-gray-500">Likes reçus</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaComment className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.comments || 0}</p>
          <p className="text-sm text-gray-500">Commentaires</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <FaTrophy className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.score || 0}</p>
          <p className="text-sm text-gray-500">Score</p>
        </div>
      </div>

      {/* ScoreBadge - en dehors de la grille */}
      <div className="mb-8">
        <ScoreBadge />
      </div>

      {/* Activité récente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaCalendar className="w-4 h-4 text-blue-500" />
          Activité récente
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucune activité récente
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-sm border-b pb-2"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-600">{activity.message}</span>
                <span className="text-gray-400 ml-auto">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}