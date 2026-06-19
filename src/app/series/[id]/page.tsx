"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, User, Lightbulb, MessageSquare, Terminal, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import {
  getSeries,
  getCoursesBySeries,
  getLessonsByCourse,
} from "@/lib/content/catalog";

const courseIcons: Record<string, React.ElementType> = {
  "book-open": BookOpen,
  user: User,
  lightbulb: Lightbulb,
  "message-square": MessageSquare,
  terminal: Terminal,
};

export default function SeriesDetailPage() {
  const params = useParams();
  const seriesId = params.id as string;
  const series = getSeries(seriesId);
  const courses = getCoursesBySeries(seriesId);
  const { user, loading: authLoading } = useAuth();
  const { isLessonCompleted } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  if (!series) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-gray-500">シリーズが見つかりません</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-6">
        <Link
          href="/home"
          className="flex items-center text-gray-500 mb-4 -ml-1"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">戻る</span>
        </Link>

        <div
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ backgroundColor: series.color }}
        >
          <h1 className="text-2xl font-extrabold mb-2">{series.title}</h1>
          <p className="text-white/80 text-sm">{series.description}</p>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-3">コース一覧</h2>

        <div className="space-y-4">
          {courses.map((course) => {
            const lessons = getLessonsByCourse(course.id);
            const completedCount = lessons.filter((l) =>
              isLessonCompleted(l.id)
            ).length;
            const Icon = courseIcons[course.icon] || BookOpen;

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon size={20} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{course.title}</h3>
                      <p className="text-gray-500 text-xs">
                        {completedCount}/{lessons.length} レッスン完了
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${lessons.length ? (completedCount / lessons.length) * 100 : 0}%`,
                        backgroundColor: series.color,
                      }}
                    />
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {lessons.map((lesson, index) => {
                    const completed = isLessonCompleted(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        href={`/drill?lesson=${lesson.id}&course=${course.id}&series=${seriesId}`}
                        className="flex items-center gap-3 px-4 py-3 active:bg-gray-50"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            completed
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm ${
                              completed ? "text-gray-400" : "text-gray-900"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {lesson.description}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
