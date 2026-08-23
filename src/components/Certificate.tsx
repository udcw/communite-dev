'use client';

import { useRef } from 'react';
import { FaTrophy, FaCheckCircle } from 'react-icons/fa';

interface CertificateProps {
  userName: string;
  quizTitle: string;
  score: number;
  date: string;
}

export default function Certificate({ userName, quizTitle, score, date }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={certRef}
      className="w-full max-w-2xl mx-auto bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-4 border-yellow-500 p-8 shadow-2xl"
      style={{ minHeight: '400px' }}
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <FaTrophy className="w-16 h-16 text-yellow-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Certificat de réussite
        </h1>
        <div className="w-24 h-1 bg-yellow-500 mx-auto my-4 rounded-full" />
        <p className="text-gray-600 dark:text-gray-300">Ce certificat est décerné à</p>
        <h2 className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 my-2">
          {userName}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          pour avoir réussi le quiz
        </p>
        <h3 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white my-2">
          {quizTitle}
        </h3>
        <div className="flex items-center justify-center gap-2 my-4">
          <span className="text-4xl font-bold text-green-600 dark:text-green-400">{score}%</span>
          <span className="text-sm text-gray-500">(seuil 80%)</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
          <FaCheckCircle className="w-5 h-5" />
          <span>Validé</span>
        </div>
        <p className="text-sm text-gray-400 mt-6">
          Délivré le {new Date(date).toLocaleDateString('fr-FR')}
        </p>
        <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-4 text-xs text-gray-400">
          Communauté Dev - Plateforme de compétences techniques
        </div>
      </div>
    </div>
  );
}
