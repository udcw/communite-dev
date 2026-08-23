import { NextRequest, NextResponse } from 'next/server';

const QUIZ_API_KEY = process.env.QUIZ_API_KEY || 'qa_sk_a4a554e366bb53cc6ddc1e03354fd49bdd120625';
const QUIZ_API_URL = 'https://quizapi.io/api/v1/questions';

// Catégories disponibles
const CATEGORIES = [
  { value: 'linux', label: 'Linux' },
  { value: 'docker', label: 'Docker' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'devops', label: 'DevOps' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'git', label: 'Git' },
  { value: 'aws', label: 'AWS' },
];

// GET - Récupérer les quiz disponibles
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'linux';
  const limit = parseInt(searchParams.get('limit') || '10');
  const difficulty = searchParams.get('difficulty') || 'medium';

  try {
    // Appel à l'API QuizAPI.io
    const url = new URL(QUIZ_API_URL);
    url.searchParams.append('apiKey', QUIZ_API_KEY);
    url.searchParams.append('category', category);
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('difficulty', difficulty);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Erreur API Quiz: ${response.status}`);
    }

    const data = await response.json();

    // Mapping sécurisé des réponses correctes
    const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

    // Transformer les données pour notre format
    const quizData = {
      id: `${category}-${Date.now()}`,
      title: `Quiz ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: `Testez vos connaissances en ${category}`,
      category: category,
      level: difficulty,
      totalQuestions: data.length,
      duration: Math.ceil(data.length * 1.5), // 1.5 minute par question
      questions: data.map((q: any) => ({
        question: q.question,
        options: [
          q.answers.answer_a,
          q.answers.answer_b,
          q.answers.answer_c,
          q.answers.answer_d,
        ].filter(Boolean),
        correctAnswer: q.correct_answer && answerMap[q.correct_answer] !== undefined
          ? answerMap[q.correct_answer]
          : 0,
        explanation: q.explanation || ''
      }))
    };

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Erreur récupération quiz:', error);
    
    // En cas d'erreur, retourner des données de fallback
    const fallbackQuiz = getFallbackQuiz(category);
    return NextResponse.json(fallbackQuiz);
  }
}

// Quiz de fallback (si l'API ne répond pas)
function getFallbackQuiz(category: string) {
  const fallbackQuestions: any = {
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
        }
      ]
    }
  };

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