"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Search, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

interface Friend {
  id: string;
  display_name: string;
  avatar_icon: string;
  friend_code: string;
  streak: number;
  total_xp: number;
}

const DEMO_FRIENDS: Friend[] = [
  {
    id: "friend-1",
    display_name: "マジくん",
    avatar_icon: "maji-kun",
    friend_code: "MAJI01",
    streak: 7,
    total_xp: 150,
  },
  {
    id: "friend-2",
    display_name: "マスター",
    avatar_icon: "master",
    friend_code: "MSTR01",
    streak: 14,
    total_xp: 320,
  },
];

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();
  const [friends] = useState<Friend[]>(DEMO_FRIENDS);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">フレンド</h1>
          <Link
            href="/add-friend"
            className="flex items-center gap-1 bg-majiai text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <UserPlus size={16} />
            追加
          </Link>
        </div>

        <Link
          href="/add-friend"
          className="flex items-center gap-3 bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm"
        >
          <div className="w-10 h-10 bg-majiai/10 rounded-full flex items-center justify-center">
            <Search size={20} className="text-majiai" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">フレンドを検索</p>
            <p className="text-gray-500 text-xs">フレンドコードで検索</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </Link>

        <h2 className="text-sm font-bold text-gray-500 mb-3">
          フレンド ({friends.length})
        </h2>

        <div className="space-y-2">
          {friends.map((friend) => (
            <Link
              key={friend.id}
              href={`/friend-detail?id=${friend.id}`}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm active:bg-gray-50"
            >
              <div className="w-12 h-12 bg-majiai/10 rounded-full flex items-center justify-center text-majiai font-bold text-lg">
                {friend.display_name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{friend.display_name}</p>
                <p className="text-gray-400 text-xs">
                  🔥 {friend.streak}日 • ⭐ {friend.total_xp} XP
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
