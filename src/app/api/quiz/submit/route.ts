import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Certification from '@/models/Certification';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { quizId, quizTitle, category, level, answers, questions } = await req.json();

    await connectDB();

    // Corriger les réponses
    let correctCount = 0;
    const results = questions.map((q: any, index: number) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        correct: isCorrect,
        correctAnswer: q.options[q.correctAnswer],
        explanation: q.explanation || ''
      };
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 80; // 🔥 Seuil à 80%

    // Enregistrer la certification
    const certification = await Certification.create({
      userId: session.user.email,
      userName: session.user.name || 'Utilisateur',
      quizId: quizId,
      quizTitle: quizTitle,
      category: category,
      level: level,
      score: score,
      passed: passed,
      totalQuestions: totalQuestions,
      correctAnswers: correctCount,
      completedAt: new Date()
    });

    return NextResponse.json({
      score,
      passed,
      totalQuestions,
      correctAnswers: correctCount,
      results,
      certificationId: certification._id
    });

  } catch (error) {
    console.error('Erreur soumission quiz:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}