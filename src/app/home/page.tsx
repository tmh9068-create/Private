"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GitBranch,
  Brain,
  Code,
  ChevronRight,
  Flame,
  Star,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { SERIES } from "@/lib/content/catalog";

const iconMap: Record<string, React.ElementType> = {
  "git-branch": GitBranch,
  brain: Brain,
  code: Code,
};

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { streak, totalXp, completedLessonIds, loading: progressLoading } =
    useProgress();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || progressLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-majiai font-bold">読み込み中...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              本気AIドリル
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              今日も学習を続けましょう！
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-streak mb-1">
              <Flame size={18} />
              <span className="text-xs font-medium">ストリーク</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{streak}日</p>
          </div>
          <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-majiai mb-1">
              <Star size={18} />
              <span className="text-xs font-medium">獲得XP</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalXp}</p>
          </div>
          <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <ChevronRight size={18} />
              <span className="text-xs font-medium">完了</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {completedLessonIds.length}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-3">学習シリーズ</h2>

        <div className="space-y-3">
          {SERIES.map((series) => {
            const Icon = iconMap[series.icon] || Code;
            return (
              <Link
                key={series.id}
                href={`/series/${series.id}`}
                className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${series.color}20` }}
                >
                  <Icon size={24} style={{ color: series.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{series.title}</h3>
                  <p className="text-gray-500 text-sm truncate">
                    {series.description}
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
