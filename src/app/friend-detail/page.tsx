"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Flame, Star } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { createClient } from "@/lib/supabase/client";

interface FriendStats {
  display_name: string;
  friend_code: string;
  streak: number;
  total_xp: number;
  lessons_completed: number;
}

function FriendDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [friend, setFriend] = useState<FriendStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      if (!id || !supabase) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("drill_user_profiles")
        .select("display_name, friend_code")
        .eq("id", id)
        .single();

      const { data: stats } = await supabase.rpc("drill_get_user_stats", {
        p_user_id: id,
      });

      const { data: progress } = await supabase
        .from("drill_device_progress")
        .select("streak")
        .eq("user_id", id)
        .maybeSingle();

      if (profile) {
        setFriend({
          display_name: profile.display_name || "ユーザー",
          friend_code: profile.friend_code,
          streak: stats?.current_streak ?? progress?.streak ?? 0,
          total_xp: stats?.total_xp ?? 0,
          lessons_completed: stats?.lessons_completed ?? 0,
        });
      }
      setLoading(false);
    };

    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <MobileLayout>
        <div className="px-4 pt-4 pb-8 text-center text-gray-400">読み込み中...</div>
      </MobileLayout>
    );
  }

  if (!friend) {
    return (
      <MobileLayout>
        <div className="px-4 pt-4 pb-8">
          <Link href="/friends" className="flex items-center text-gray-500 mb-4 -ml-1">
            <ChevronLeft size={20} />
            <span className="text-sm">戻る</span>
          </Link>
          <p className="text-center text-gray-500">ユーザーが見つかりませんでした</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 pt-4 pb-8">
        <Link
          href="/friends"
          className="flex items-center text-gray-500 mb-4 -ml-1"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">戻る</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-majiai/10 rounded-full flex items-center justify-center text-majiai font-extrabold text-4xl mx-auto mb-4">
            {friend.display_name.charAt(0)}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {friend.display_name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{friend.friend_code}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <Flame size={20} className="text-streak mx-auto mb-1" />
            <p className="text-xl font-bold">{friend.streak}</p>
            <p className="text-xs text-gray-400">ストリーク</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <Star size={20} className="text-majiai mx-auto mb-1" />
            <p className="text-xl font-bold">{friend.total_xp}</p>
            <p className="text-xs text-gray-400">獲得XP</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-xl font-bold">{friend.lessons_completed}</p>
            <p className="text-xs text-gray-400">完了レッスン</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

export default function FriendDetailPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <FriendDetailContent />
    </Suspense>
  );
}
