import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';
import { HiCode } from 'react-icons/hi';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Communauté Dev',
  description: 'Plateforme pour développeurs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <AuthProvider>
          <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="w-full px-4 py-3 flex justify-between items-center max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <HiCode className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-xl text-gray-800 dark:text-white">Communauté Dev</span>
              </div>
              <AuthButton />
            </div>
          </nav>
          <main className="w-full px-4 py-8 max-w-7xl mx-auto">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
            <div className="w-full px-4 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 Communauté Dev</p>
                <div className="flex gap-6">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
                    <FaGithub className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition">
                    <FaTwitter className="w-5 h-5" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition">
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}