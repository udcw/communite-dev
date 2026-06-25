import type { Metadata } from 'next';
import Image from 'next/image';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';

// Configuration du titre et de votre logo pour l'onglet du navigateur
export const metadata: Metadata = {
  title: 'Communauté Dev',
  description: 'Plateforme pour développeurs',
  icons: {
    icon: '/logo.png',       // Votre logo dans l'onglet
    apple: '/logo.png',      // Votre logo sur les appareils Apple
  },
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
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
              
              {/* Alignement parfait de votre logo et de votre titre */}
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.png" // Votre logo affiché sur la page
                  alt="Communauté Dev" 
                  width={36} 
                  height={36}
                  className="rounded-lg" // Optionnel : arrondit légèrement les angles de votre logo
                />
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Communauté Dev
                </span>
              </div>
              
              <AuthButton />
            </div>
          </nav>
          
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2026 Communauté Dev
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
