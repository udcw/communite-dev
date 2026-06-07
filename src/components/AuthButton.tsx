'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { FaGithub } from 'react-icons/fa';
import { HiLogout, HiUser } from 'react-icons/hi';
import { useState } from 'react';

export default function AuthButton() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (session) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <HiUser className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium">{session.user?.name}</span>
          <span className="text-xs">▼</span>
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <HiLogout className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
    >
      <FaGithub className="w-5 h-5" />
      Se connecter avec GitHub
    </button>
  );
}