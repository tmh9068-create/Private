"use client";

import { useState } from "react";
import { Trophy, Flame } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";

type TabType = "weekly" | "monthly" | "total";

const DEMO_RANKING = [
  { rank: 1, display_name: "マスター", avatar_icon: "master", total_xp: 320, streak: 14 },
  { rank: 2, display_name: "マジくん", avatar_icon: "maji-kun", total_xp: 150, streak: 7 },
  { rank: 3, display_name: "デモユーザー", avatar_icon: "maji-kun", total_xp: 50, streak: 3 },
];

export default function RankingPage() {
  const [tab, setTab] = useState<TabType>("weekly");
  const { profile } = useAuth();
  const { totalXp, streak } = useProgress();

  const tabs: { key: TabType; label: string }[] = [
    { key: "weekly", label: "週間" },
    { key: "monthly", label: "月間" },
    { key: "total", label: "累計" },
  ];

  const ranking = DEMO_RANKING.map((entry, i) =>
    i === 2
      ? { ...entry, display_name: profile?.display_name || "あなた", total_xp: totalXp, streak }
      : entry
  ).sort((a, b) => b.total_xp - a.total_xp);

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">
          フレンドランキング
        </h1>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-white text-majiai shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {ranking.map((entry, index) => {
            const isMe = entry.display_name === (profile?.display_name || "あなた") || index === 2;
            return (
              <div
                key={entry.rank}
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
                  {index === 0 ? (
                    <Trophy size={16} />
                  ) : (
                    index + 1
                  )}
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
      </div>
    </AppLayout>
  );
}
