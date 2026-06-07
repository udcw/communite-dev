import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';
import { Code2 } from 'lucide-react';

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
      <body className="bg-gray-50">
        <AuthProvider>
          <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code2 size={24} className="text-blue-400" />
                <h1 className="text-xl font-bold">Communauté Dev</h1>
              </div>
              <AuthButton />
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}