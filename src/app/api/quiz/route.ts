import { NextRequest, NextResponse } from 'next/server';

// QuizAPI.io - Clé gratuite à obtenir sur https://quizapi.io
const QUIZ_API_KEY = process.env.QUIZ_API_KEY;
const QUIZ_API_URL = 'https://quizapi.io/api/v1/questions';

// GET - Récupérer les quiz disponibles
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'linux';
  const limit = parseInt(searchParams.get('limit') || '10');
  const difficulty = searchParams.get('difficulty') || 'medium';

  // Vérifier si la clé API est définie
  if (!QUIZ_API_KEY || QUIZ_API_KEY === 'votre_clé_api') {
    console.warn('⚠️ QUIZ_API_KEY non définie ou invalide, utilisation du fallback');
    return NextResponse.json(getFallbackQuiz(category));
  }

  try {
    // Construction de l'URL
    const url = new URL(QUIZ_API_URL);
    url.searchParams.append('apiKey', QUIZ_API_KEY);
    url.searchParams.append('category', category);
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('difficulty', difficulty);
    url.searchParams.append('_t', Date.now().toString()); // Anti-cache

    console.log(`🔍 Appel à QuizAPI: ${category}, ${difficulty}, ${limit} questions`);

    const response = await fetch(url.toString(), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur API (${response.status}):`, errorText);
      return NextResponse.json(getFallbackQuiz(category));
    }

    const data = await response.json();

    // Vérifier que les données sont valides
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ Aucune question reçue, utilisation du fallback');
      return NextResponse.json(getFallbackQuiz(category));
    }

    console.log(`✅ ${data.length} questions reçues de l'API`);

    // Mélanger les questions pour plus de variété
    const shuffledData = shuffleArray(data);

    // Mapping sécurisé des réponses correctes
    const answerMap: Record<string, number> = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
    };

    // Transformer les données pour notre format
    const quizData = {
      id: `${category}-${Date.now()}`,
      title: `Quiz ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: `Testez vos connaissances en ${category}`,
      category: category,
      level: difficulty,
      totalQuestions: shuffledData.length,
      duration: Math.ceil(shuffledData.length * 1.5),
      questions: shuffledData.map((q: any) => ({
        question: q.question || 'Question non disponible',
        options: [
          q.answers?.answer_a,
          q.answers?.answer_b,
          q.answers?.answer_c,
          q.answers?.answer_d,
        ].filter(Boolean),
        correctAnswer: q.correct_answer && answerMap[q.correct_answer] !== undefined
          ? answerMap[q.correct_answer]
          : 0,
        explanation: q.explanation || '',
      })),
    };

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('❌ Erreur lors du fetch:', error);
    return NextResponse.json(getFallbackQuiz(category));
  }
}

// 🔥 Fonction pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Quiz de fallback (si l'API ne répond pas)
function getFallbackQuiz(category: string) {
  const fallbackQuestions: Record<string, any> = {
    linux: {
      title: 'Quiz Linux',
      description: 'Testez vos connaissances en Linux',
      questions: [
        {
          question: 'Quelle commande permet de lister les fichiers ?',
          options: ['ls', 'dir', 'list', 'show'],
          correctAnswer: 0,
          explanation: 'ls est la commande standard pour lister les fichiers sous Linux.'
        },
        {
          question: 'Que signifie "sudo" ?',
          options: ['Super User DO', 'System User DO', 'Simple User DO', 'Standard User DO'],
          correctAnswer: 0,
          explanation: 'sudo permet d\'exécuter une commande avec les privilèges superutilisateur.'
        },
        {
          question: 'Quel est le système de gestion de paquets utilisé par Debian ?',
          options: ['apt', 'yum', 'pacman', 'zypper'],
          correctAnswer: 0,
          explanation: 'Debian utilise apt (Advanced Package Tool) comme gestionnaire de paquets.'
        },
        {
          question: 'Quelle commande permet de changer les permissions d\'un fichier ?',
          options: ['chmod', 'chown', 'chgrp', 'chattr'],
          correctAnswer: 0,
          explanation: 'chmod (change mode) permet de modifier les permissions d\'un fichier.'
        },
        {
          question: 'Quel est le shell par défaut dans la plupart des distributions Linux ?',
          options: ['bash', 'zsh', 'fish', 'tcsh'],
          correctAnswer: 0,
          explanation: 'bash (Bourne Again SHell) est le shell par défaut dans la plupart des distributions Linux.'
        }
      ]
    },
    docker: {
      title: 'Quiz Docker',
      description: 'Testez vos connaissances en Docker',
      questions: [
        {
          question: 'Quelle commande permet de lister les containers ?',
          options: ['docker ps', 'docker list', 'docker show', 'docker containers'],
          correctAnswer: 0,
          explanation: 'docker ps liste les containers en cours d\'exécution.'
        },
        {
          question: 'Que signifie l\'option `-d` dans `docker run` ?',
          options: ['Detached mode', 'Debug mode', 'Delete after run', 'Download image'],
          correctAnswer: 0,
          explanation: '`-d` signifie "detached mode" : le container tourne en arrière-plan.'
        },
        {
          question: 'Quelle est la différence entre une image et un container ?',
          options: [
            'Une image est un modèle, un container est une instance',
            'Un container est un modèle, une image est une instance',
            'C\'est la même chose',
            'Une image est pour le développement, un container pour la production'
          ],
          correctAnswer: 0,
          explanation: 'Une image Docker est un modèle statique, un container est une instance en cours d\'exécution de cette image.'
        },
        {
          question: 'Quelle commande permet de construire une image Docker ?',
          options: ['docker build', 'docker create', 'docker image', 'docker make'],
          correctAnswer: 0,
          explanation: 'docker build construit une image à partir d\'un Dockerfile.'
        }
      ]
    },
    javascript: {
      title: 'Quiz JavaScript',
      description: 'Testez vos connaissances en JavaScript',
      questions: [
        {
          question: 'Quel mot-clé permet de déclarer une variable en JavaScript ?',
          options: ['let', 'var', 'const', 'Toutes les réponses'],
          correctAnswer: 3,
          explanation: 'JavaScript permet de déclarer des variables avec let, var et const.'
        },
        {
          question: 'Quelle méthode permet de transformer un tableau ?',
          options: ['map()', 'filter()', 'reduce()', 'Toutes les réponses'],
          correctAnswer: 3,
          explanation: 'map(), filter() et reduce() sont des méthodes de transformation de tableau.'
        },
        {
          question: 'Que retourne `typeof null` en JavaScript ?',
          options: ['"null"', '"object"', '"undefined"', '"number"'],
          correctAnswer: 1,
          explanation: 'typeof null retourne "object" en JavaScript (bug historique).'
        }
      ]
    }
  };

  // Sélectionner le fallback correspondant à la catégorie
  const quiz = fallbackQuestions[category] || fallbackQuestions.linux;

  return {
    id: `${category}-fallback-${Date.now()}`,
    title: quiz.title,
    description: quiz.description,
    category,
    level: 'medium',
    totalQuestions: quiz.questions.length,
    duration: Math.ceil(quiz.questions.length * 1.5),
    questions: quiz.questions.map((q: any) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    }))
  };
}