import { NextRequest, NextResponse } from "next/server";

const OPENTDB_URL = "https://opentdb.com/api.php";

// Interface pour les questions OpenTDB
interface OpenTDBQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: string;
  type: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "linux";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
  const difficulty = searchParams.get("difficulty") || "medium";

  const categoryMap: Record<string, number> = {
    linux: 18,
    docker: 18,
    python: 18,
    javascript: 18,
    react: 18,
    nodejs: 18,
    mongodb: 18,
    git: 18,
    aws: 18,
    devops: 18,
    kubernetes: 18,
  };

  // Fonction pour récupérer un lot de questions
  const fetchQuestionsBatch = async (
    amount: number,
  ): Promise<OpenTDBQuestion[]> => {
    const url = new URL(OPENTDB_URL);
    url.searchParams.append("amount", String(Math.min(amount, 50)));
    url.searchParams.append("category", String(categoryMap[category] || 18));
    url.searchParams.append("difficulty", difficulty);
    url.searchParams.append("type", "multiple");
    url.searchParams.append("_t", Date.now().toString());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`OpenTDB error: ${res.status}`);
    const data = await res.json();
    if (data.response_code !== 0) throw new Error("No questions from OpenTDB");
    return data.results;
  };

  try {
    // 🔥 Type explicite pour allQuestions
    let allQuestions: OpenTDBQuestion[] = [];
    let remaining = limit;
    const maxPerRequest = 50;

    while (remaining > 0) {
      const batch = Math.min(remaining, maxPerRequest);
      const results = await fetchQuestionsBatch(batch);
      allQuestions = allQuestions.concat(results);
      remaining -= batch;
      if (remaining > 0)
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Mélanger les questions
    allQuestions = shuffleArray(allQuestions);

    const quizData = {
      id: `${category}-${Date.now()}`,
      title: `Quiz ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: `Testez vos connaissances en ${category}`,
      category,
      level: difficulty,
      totalQuestions: allQuestions.length,
      duration: Math.ceil(allQuestions.length * 1.2),
      questions: allQuestions.map((q: OpenTDBQuestion) => {
        const options = [...q.incorrect_answers, q.correct_answer];
        const shuffledOptions = shuffleArray(options);
        const correctIndex = shuffledOptions.indexOf(q.correct_answer);
        return {
          question: q.question
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, "&"),
          options: shuffledOptions.map((opt: string) =>
            opt
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/&amp;/g, "&"),
          ),
          correctAnswer: correctIndex,
          explanation: `Réponse correcte : ${q.correct_answer}`,
        };
      }),
    };

    return NextResponse.json(quizData);
  } catch (error) {
    console.error("❌ Erreur:", error);
    return NextResponse.json(getFallbackQuiz(category));
  }
}

// Utilitaires
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getFallbackQuiz(category: string) {
  const fallbacks: Record<string, any> = {
    linux: {
      title: "Quiz Linux",
      description: "Testez vos connaissances en Linux",
      questions: [
        {
          question: "Quelle commande permet de lister les fichiers ?",
          options: ["ls", "dir", "list", "show"],
          correctAnswer: 0,
          explanation:
            "ls est la commande standard pour lister les fichiers sous Linux.",
        },
        {
          question: 'Que signifie "sudo" ?',
          options: [
            "Super User DO",
            "System User DO",
            "Simple User DO",
            "Standard User DO",
          ],
          correctAnswer: 0,
          explanation:
            "sudo permet d'exécuter une commande avec les privilèges superutilisateur.",
        },
      ],
    },
    docker: {
      title: "Quiz Docker",
      description: "Testez vos connaissances en Docker",
      questions: [
        {
          question: "Quelle commande permet de lister les containers ?",
          options: [
            "docker ps",
            "docker list",
            "docker show",
            "docker containers",
          ],
          correctAnswer: 0,
          explanation: "docker ps liste les containers en cours d'exécution.",
        },
      ],
    },
  };

  const quiz = fallbacks[category] || fallbacks.linux;
  return {
    id: `fallback-${Date.now()}`,
    title: quiz.title,
    description: quiz.description,
    category,
    level: "medium",
    totalQuestions: quiz.questions.length,
    duration: Math.ceil(quiz.questions.length * 1.2),
    questions: quiz.questions.map((q: any) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    })),
  };
}
