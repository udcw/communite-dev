import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { HiCode } from 'react-icons/hi';

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
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <AuthProvider>
          <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HiCode className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-xl text-gray-800">Communauté Dev</span>
              </div>
              <AuthButton />
            </div>
          </nav>
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 py-8 mt-16">
            <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">© 2026 Communauté Dev</p>
              <div className="flex gap-4">
                <FaGithub className="w-5 h-5 text-gray-400 hover:text-gray-800 cursor-pointer" />
                <FaTwitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
                <FaLinkedin className="w-5 h-5 text-gray-400 hover:text-blue-700 cursor-pointer" />
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}