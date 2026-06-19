"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Star } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/Button";
import { getLesson } from "@/lib/content/catalog";

function LessonCompleteContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson") || "";
  const courseId = searchParams.get("course") || "";
  const seriesId = searchParams.get("series") || "";
  const score = parseInt(searchParams.get("score") || "0", 10);
  const passed = searchParams.get("passed") === "true";
  const lesson = getLesson(lessonId);
  const router = useRouter();

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
            passed ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {passed ? (
            <CheckCircle2 size={48} className="text-green-500" />
          ) : (
            <XCircle size={48} className="text-red-500" />
          )}
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          {passed ? "おめでとうございます！" : "もう一度挑戦しよう"}
        </h1>

        <p className="text-gray-500 mb-2">{lesson?.title}</p>

        <div className="flex items-center gap-2 text-majiai mb-8">
          <Star size={20} />
          <span className="text-3xl font-bold">{score}%</span>
        </div>

        {passed ? (
          <p className="text-gray-600 mb-8">
            レッスンを完了しました！+10 XP を獲得
          </p>
        ) : (
          <p className="text-gray-600 mb-8">
            あと少しです。苦手な分野のレッスンを復習してから再挑戦すると、合格に近づけます。
          </p>
        )}

        <div className="w-full space-y-3">
          {passed ? (
            <Button onClick={() => router.push(`/series/${seriesId}`)}>
              コースに戻る
            </Button>
          ) : (
            <Button
              onClick={() =>
                router.push(
                  `/drill?lesson=${lessonId}&course=${courseId}&series=${seriesId}`
                )
              }
            >
              もう一度挑戦
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => router.push("/home")}
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}

export default function LessonCompletePage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <LessonCompleteContent />
    </Suspense>
  );
}
