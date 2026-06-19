"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy, Flame } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface RankingEntry {
  user_id: string;
  display_name: string;
  avatar_icon: string;
  total_xp: number;
  streak: number;
  rank: number;
}

export default function RankingPage() {
  const { user, profile } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadRanking = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("drill_get_friend_ranking");

    if (!error && data) {
      setRanking(
        data.map((entry: RankingEntry) => ({
          ...entry,
          display_name: entry.display_name || "ユーザー",
        }))
      );
    }
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">
          フレンドランキング
        </h1>

        {loading ? (
          <p className="text-gray-400 text-center py-8">読み込み中...</p>
        ) : ranking.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-gray-100 text-center text-gray-500 text-sm">
            ランキングに表示するユーザーがいません。フレンドを追加すると比較できます。
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((entry, index) => {
              const isMe = entry.user_id === user?.id;
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 rounded-xl p-4 ${
                    isMe
                      ? "bg-majiai/5 border-2 border-majiai/20"
                      : "bg-white border border-gray-100"
                  } shadow-sm`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-600"
                        : index === 1
                        ? "bg-gray-100 text-gray-500"
                        : index === 2
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {index === 0 ? <Trophy size={16} /> : entry.rank}
                  </div>
                  <div className="w-10 h-10 bg-majiai/10 rounded-full flex items-center justify-center text-majiai font-bold">
                    {entry.display_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      {entry.display_name}
                      {isMe && (
                        <span className="text-majiai text-xs ml-1">（あなた）</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Flame size={12} className="text-streak" />
                        {entry.streak}日
                      </span>
                      <span>⭐ {entry.total_xp} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {profile?.friend_code && (
          <p className="text-center text-gray-400 text-xs mt-6">
            あなたのフレンドコード: {profile.friend_code}
          </p>
        )}
      </div>
    </AppLayout>
  );
}
