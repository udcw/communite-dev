'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { FaGithub, FaSignOutAlt, FaUser, FaChevronDown, FaSearch, FaUserCog, FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';

export default function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <NotificationBell />
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <FaUser className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">{session.user?.name}</span>
            <FaChevronDown className="w-3 h-3" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/profile/${encodeURIComponent(session.user?.email || '')}`);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaUser className="w-4 h-4" />
                Mon profil
              </button>
              
              {/* Messages */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push('/messages');
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaEnvelope className="w-4 h-4" />
                Messages
              </button>
              
              {/* Espace recruteur */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push('/recruiters');
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaSearch className="w-4 h-4" />
                Espace recruteur
              </button>

              {/* Admin Dashboard - UNIQUEMENT pour les admins */}
              {session?.user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/admin');
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  <FaUserCog className="w-4 h-4" />
                  Admin Dashboard
                </button>
              )}
              
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105"
    >
      <FaGithub className="w-4 h-4" />
      Se connecter
    </button>
  );
}