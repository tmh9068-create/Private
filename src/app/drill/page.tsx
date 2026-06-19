"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { X, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { getQuiz } from "@/lib/content/quizzes";
import { getLesson } from "@/lib/content/catalog";
import type { QuizQuestion } from "@/types";

function DrillContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson") || "";
  const courseId = searchParams.get("course") || "";
  const seriesId = searchParams.get("series") || "";

  const quiz = getQuiz(lessonId);
  const lesson = getLesson(lessonId);
  const { user, loading: authLoading } = useAuth();
  const { completeLesson } = useProgress();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  if (!quiz || !lesson) {
    return (
      <MobileLayout>
        <div className="p-6 text-center text-gray-500">
          クイズが見つかりません
        </div>
      </MobileLayout>
    );
  }

  const question: QuizQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const isLast = currentIndex === quiz.questions.length - 1;

  const handleSelect = (optionId: string) => {
    if (showFeedback) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setCorrectCount((c) => c + 1);
  };

  const handleNext = async () => {
    if (isLast) {
      const finalCorrect = correctCount;
      const score = Math.round((finalCorrect / quiz.questions.length) * 100);
      const passed = finalCorrect >= Math.ceil(quiz.questions.length * 0.6);

      if (passed) {
        await completeLesson(lessonId, courseId, 10);
      }

      router.push(
        `/lesson-complete?lesson=${lessonId}&course=${courseId}&series=${seriesId}&score=${score}&passed=${passed}`
      );
      return;
    }

    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowHint(false);
  };

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Link
            href={`/series/${seriesId}`}
            className="w-10 h-10 flex items-center justify-center text-gray-400"
          >
            <X size={24} />
          </Link>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-majiai rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-gray-500 font-medium tabular-nums">
            {currentIndex + 1}/{quiz.questions.length}
          </span>
        </div>

        <div className="flex-1 px-4 py-6">
          <p className="text-majiai text-sm font-medium mb-2">{lesson.title}</p>
          <h2 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
            {question.question}
          </h2>

          {question.hint && !showFeedback && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-amber-600 text-sm mb-4"
            >
              <Lightbulb size={16} />
              ヒントを見る
            </button>
          )}

          {showHint && question.hint && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-amber-800 text-sm">{question.hint}</p>
            </div>
          )}

          <div className="space-y-3">
            {question.options?.map((option) => {
              let style = "border-gray-200 bg-white text-gray-800";
              if (showFeedback) {
                if (option.id === question.correctAnswer) {
                  style = "border-green-500 bg-green-50 text-green-800";
                } else if (option.id === selectedAnswer) {
                  style = "border-red-500 bg-red-50 text-red-800";
                } else {
                  style = "border-gray-100 bg-gray-50 text-gray-400";
                }
              } else if (selectedAnswer === option.id) {
                style = "border-majiai bg-majiai/5 text-majiai";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-colors ${style}`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div
              className={`mt-6 p-4 rounded-xl ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <XCircle size={20} className="text-red-600" />
                )}
                <span
                  className={`font-bold ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect ? "正解！" : "不正解"}
                </span>
              </div>
              {question.explanation && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {question.explanation}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-4 pb-8 pt-2">
          {!showFeedback ? (
            <Button onClick={handleSubmit} disabled={!selectedAnswer}>
              回答する
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {isLast ? "結果を見る" : "次の問題へ"}
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

export default function DrillPage() {
  return (
    <Suspense
      fallback={
        <MobileLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-majiai font-bold">読み込み中...</div>
          </div>
        </MobileLayout>
      }
    >
      <DrillContent />
    </Suspense>
  );
}
