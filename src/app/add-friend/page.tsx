"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, UserPlus } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const DEMO_USERS = [
  { id: "u1", display_name: "サプライズ太郎", friend_code: "SPR001" },
  { id: "u2", display_name: "AI学習者", friend_code: "AI0001" },
];

export default function AddFriendPage() {
  const [code, setCode] = useState("");
  const [searchResult, setSearchResult] = useState<
    (typeof DEMO_USERS)[0] | null
  >(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = () => {
    setError("");
    setSent(false);
    const found = DEMO_USERS.find(
      (u) => u.friend_code.toUpperCase() === code.trim().toUpperCase()
    );
    if (found) {
      setSearchResult(found);
    } else {
      setSearchResult(null);
      setError("ユーザーが見つかりませんでした");
    }
  };

  const handleSendRequest = () => {
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
              placeholder="フレンドコード（例: DEMO01）"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              icon={<Search size={18} />}
            />
          </div>
        </div>

        <Button onClick={handleSearch} className="mb-6">
          検索
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
            <Button onClick={handleSendRequest}>
              <span className="flex items-center gap-2">
                <UserPlus size={18} />
                フレンド申請を送る
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
