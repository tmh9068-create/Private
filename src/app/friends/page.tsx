"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Search, ChevronRight, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface Friend {
  id: string;
  display_name: string;
  avatar_icon: string;
  friend_code: string;
  streak: number;
  total_xp: number;
}

interface PendingRequest {
  id: string;
  from_user_id: string;
  display_name: string;
  avatar_icon: string;
  friend_code: string;
}

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const loadFriends = useCallback(async () => {
    if (!supabase || !user) return;

    const [{ data: friendData }, { data: pendingData }] = await Promise.all([
      supabase.rpc("drill_get_friends"),
      supabase.rpc("drill_get_pending_friend_requests"),
    ]);

    setFriends(
      (friendData ?? []).map((f: Friend) => ({
        ...f,
        display_name: f.display_name || "ユーザー",
      }))
    );
    setPending(
      (pendingData ?? []).map((r: PendingRequest) => ({
        ...r,
        display_name: r.display_name || "ユーザー",
      }))
    );
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadFriends();
  }, [user, loadFriends]);

  const acceptRequest = async (requestId: string) => {
    if (!supabase) return;
    await supabase.rpc("drill_accept_friend_request", {
      p_request_id: requestId,
    });
    await loadFriends();
  };

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

        {pending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-500 mb-3">
              フレンド申請 ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-majiai/20 shadow-sm"
                >
                  <div className="w-12 h-12 bg-majiai/10 rounded-full flex items-center justify-center text-majiai font-bold text-lg">
                    {req.display_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{req.display_name}</p>
                    <p className="text-gray-400 text-xs">{req.friend_code}</p>
                  </div>
                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="flex items-center gap-1 bg-majiai text-white px-3 py-2 rounded-lg text-sm font-bold"
                  >
                    <Check size={14} />
                    承認
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-sm font-bold text-gray-500 mb-3">
          フレンド ({loading ? "..." : friends.length})
        </h2>

        {!loading && friends.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-gray-100 text-center text-gray-500 text-sm">
            まだフレンドがいません。フレンドコードで検索して追加しましょう。
          </div>
        ) : (
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
        )}
      </div>
    </AppLayout>
  );
}
