"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, UserPlus } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SearchResult {
  id: string;
  display_name: string;
  friend_code: string;
  avatar_icon: string;
}

export default function AddFriendPage() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const supabase = createClient();

  const handleSearch = async () => {
    setError("");
    setSent(false);
    setSearchResult(null);

    if (!code.trim()) {
      setError("フレンドコードを入力してください");
      return;
    }

    if (!supabase || !user) {
      setError("ログインが必要です");
      return;
    }

    setSearching(true);
    const { data, error: rpcError } = await supabase.rpc(
      "drill_search_user_by_code",
      { p_code: code.trim() }
    );
    setSearching(false);

    if (rpcError) {
      setError("検索に失敗しました");
      return;
    }

    const found = data?.[0] as SearchResult | undefined;
    if (found) {
      setSearchResult({
        ...found,
        display_name: found.display_name || "ユーザー",
      });
    } else {
      setError("ユーザーが見つかりませんでした");
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult || !supabase) return;

    setSending(true);
    const { error: rpcError } = await supabase.rpc("drill_send_friend_request", {
      p_to_user_id: searchResult.id,
    });
    setSending(false);

    if (rpcError) {
      setError(rpcError.message.includes("yourself")
        ? "自分自身は追加できません"
        : "申請の送信に失敗しました");
      return;
    }

    setSent(true);
  };

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

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          フレンドを追加
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          フレンドコードを入力して検索してください
        </p>

        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              label=""
              placeholder="フレンドコード（例: ABC123）"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              icon={<Search size={18} />}
            />
          </div>
        </div>

        <Button onClick={handleSearch} className="mb-6" disabled={searching}>
          {searching ? "検索中..." : "検索"}
        </Button>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {searchResult && !sent && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-majiai/10 rounded-full flex items-center justify-center text-majiai font-bold text-lg">
                {searchResult.display_name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {searchResult.display_name}
                </p>
                <p className="text-gray-400 text-xs">
                  {searchResult.friend_code}
                </p>
              </div>
            </div>
            <Button onClick={handleSendRequest} disabled={sending}>
              <span className="flex items-center gap-2">
                <UserPlus size={18} />
                {sending ? "送信中..." : "フレンド申請を送る"}
              </span>
            </Button>
          </div>
        )}

        {sent && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 text-sm text-center">
              フレンド申請を送信しました！相手の承認をお待ちください。
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
