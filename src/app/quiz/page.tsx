"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FaTrophy,
  FaClock,
  FaCode,
  FaCheckCircle,
  FaTimesCircle,
  FaLinux,
  FaDocker,
  FaAws,
  FaGitAlt,
  FaPython,
  FaJs,
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaRocket,
  FaSeedling,
  FaBookOpen,
  FaGraduationCap,
  FaServer,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { SiKubernetes } from "react-icons/si";

const CATEGORIES = [
  { value: "linux", label: "Linux", icon: <FaLinux className="w-4 h-4" /> },
  { value: "docker", label: "Docker", icon: <FaDocker className="w-4 h-4" /> },
  {
    value: "kubernetes",
    label: "Kubernetes",
    icon: <SiKubernetes className="w-4 h-4" />,
  },
  { value: "devops", label: "DevOps", icon: <FaRocket className="w-4 h-4" /> },
  { value: "python", label: "Python", icon: <FaPython className="w-4 h-4" /> },
  {
    value: "javascript",
    label: "JavaScript",
    icon: <FaJs className="w-4 h-4" />,
  },
  { value: "react", label: "React", icon: <FaReact className="w-4 h-4" /> },
  { value: "nodejs", label: "Node.js", icon: <FaNodeJs className="w-4 h-4" /> },
  {
    value: "mongodb",
    label: "MongoDB",
    icon: <FaDatabase className="w-4 h-4" />,
  },
  { value: "git", label: "Git", icon: <FaGitAlt className="w-4 h-4" /> },
  { value: "aws", label: "AWS", icon: <FaAws className="w-4 h-4" /> },
];

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Débutant",
    icon: <FaSeedling className="w-4 h-4" />,
  },
  {
    value: "medium",
    label: "Intermédiaire",
    icon: <FaBookOpen className="w-4 h-4" />,
  },
  {
    value: "hard",
    label: "Avancé",
    icon: <FaGraduationCap className="w-4 h-4" />,
  },
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  totalQuestions: number;
  duration: number;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("linux");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [questionsCount, setQuestionsCount] = useState(10);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  // Charger l'historique des certifications
  useEffect(() => {
    const fetchHistory = async () => {
      if (session) {
        const res = await fetch("/api/user/certifications");
        const data = await res.json();
        setQuizHistory(data || []);
      }
    };
    fetchHistory();
  }, [session]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/quiz?category=${selectedCategory}&limit=${questionsCount}&difficulty=${selectedDifficulty}`,
      );
      const data = await res.json();
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(-1));
      setCurrentQuestion(0);
      setStarted(true);
      setTimeLeft(data.duration * 60);
      setFinished(false);
    } catch (error) {
      console.error("Erreur chargement quiz:", error);
    }
    setLoading(false);
  };

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.category,
        level: quiz.level,
        answers,
        questions: quiz.questions,
      }),
    });
    const data = await res.json();
    setResult(data);
    setFinished(true);
  };

  if (!session) {
    return (
      <div className="text-center py-20">
        <FaCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Connectez-vous pour accéder aux quiz</p>
      </div>
    );
  }

  if (finished && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 text-center">
          <div className="flex justify-center mb-4">
            {result.passed ? (
              <FaCheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <FaTimesCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {result.passed ? "Félicitations !" : "Continue à t'entraîner !"}
          </h2>
          <p className="text-lg mb-4">
            Score : <span className="font-bold">{result.score}%</span>
          </p>
          <p className="text-sm text-gray-500">
            {result.correctAnswers} / {result.totalQuestions} bonnes réponses
          </p>
          {result.passed && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center gap-2">
              <FaTrophy className="w-5 h-5 text-yellow-500" />
              <p className="text-green-700 dark:text-green-300">
                Certification obtenue pour {quiz?.title} !
              </p>
            </div>
          )}
          <button
            onClick={() => {
              setStarted(false);
              setFinished(false);
              setQuiz(null);
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <FaArrowRight className="w-4 h-4" />
            Nouveau quiz
          </button>
        </div>
      </div>
    );
  }

  if (started && quiz) {
    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1}/{quiz.questions.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center gap-3 ${
                    answers[currentQuestion] === index
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <FaClock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
            </div>
            <button
              onClick={nextQuestion}
              disabled={answers[currentQuestion] === -1}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {currentQuestion === quiz.questions.length - 1
                ? "Terminer"
                : "Suivant"}
              <FaArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <FaCode className="text-blue-500 w-8 h-8" />
        Quiz techniques
      </h1>

      {/* Configuration du quiz */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <FaServer className="w-4 h-4" />
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <FaGraduationCap className="w-4 h-4" />
              Difficulté
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              Questions
            </label>
            <select
              value={questionsCount}
              onChange={(e) => setQuestionsCount(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchQuiz}
          disabled={loading}
          className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <FaRocket className="w-4 h-4" />
              Commencer le quiz
            </>
          )}
        </button>
      </div>

      {/* Historique des certifications */}
      {quizHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500 w-5 h-5" />
            Mes certifications
          </h3>
          <div className="space-y-2">
            {quizHistory.map((cert: any) => (
              <div
                key={cert._id}
                className="flex items-center justify-between p-2 border-b"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{cert.quizTitle}</span>
                  <span className="text-sm text-gray-500">{cert.score}%</span>
                  {cert.passed && (
                    <FaCheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(cert.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
