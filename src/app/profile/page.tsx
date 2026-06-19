"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  ChevronRight,
  Copy,
  Flame,
  Star,
  BookOpen,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { streak, totalXp, completedLessonIds } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  const copyFriendCode = () => {
    if (profile?.friend_code) {
      navigator.clipboard.writeText(profile.friend_code);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">プロフィール</h1>
          <Link href="/settings" className="text-gray-400 p-2">
            <Settings size={22} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-4 text-center">
          <div className="w-20 h-20 bg-majiai/10 rounded-full flex items-center justify-center text-majiai font-extrabold text-3xl mx-auto mb-3">
            {(profile?.display_name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {profile?.display_name || "ユーザー"}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{user?.email}</p>

          <button
            onClick={copyFriendCode}
            className="mt-4 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl text-sm"
          >
            <span className="text-gray-500">フレンドコード:</span>
            <span className="font-bold text-majiai">
              {profile?.friend_code || "------"}
            </span>
            <Copy size={14} className="text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <Flame size={20} className="text-streak mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{streak}</p>
            <p className="text-xs text-gray-400">ストリーク</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <Star size={20} className="text-majiai mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{totalXp}</p>
            <p className="text-xs text-gray-400">獲得XP</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <BookOpen size={20} className="text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">
              {completedLessonIds.length}
            </p>
            <p className="text-xs text-gray-400">完了レッスン</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href="/select-icon"
            className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <span className="font-medium text-gray-900">アイコンを変更</span>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
          <Link
            href="/settings"
            className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <span className="font-medium text-gray-900">設定</span>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
