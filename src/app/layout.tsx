import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';

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
            <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💻</span>
                <span className="font-bold text-xl text-gray-800 dark:text-white">Communauté Dev</span>
              </div>
              <AuthButton />
            </div>
          </nav>
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-700 py-8 mt-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 Communauté Dev</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}