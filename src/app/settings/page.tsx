"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { profile, signOut, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setDisplayName(profile?.display_name || "");
  }, [profile?.display_name]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const { error: saveError } = await updateProfile({
      display_name: displayName.trim() || null,
    });
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <MobileLayout>
      <div className="px-4 pt-4 pb-8">
        <Link
          href="/profile"
          className="flex items-center text-gray-500 mb-4 -ml-1"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">戻る</span>
        </Link>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">設定</h1>

        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
          <Input
            label="表示名"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="表示名を入力"
          />
          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}
          <Button onClick={handleSave} size="md" disabled={saving}>
            {saved ? "保存しました！" : saving ? "保存中..." : "保存"}
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <Link
            href="/forgot-password"
            className="flex items-center justify-between px-4 py-4 border-b border-gray-50 text-gray-900"
          >
            パスワードを変更
          </Link>
          <a
            href="https://surpriselife.notion.site/1f466d0e7d50804786e1dfa104983317"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-4 border-b border-gray-50 text-gray-900"
          >
            利用規約
          </a>
          <a
            href="https://surpriselife.notion.site/1a366d0e7d50802fa9b5c9518474eff5"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-4 text-gray-900"
          >
            プライバシーポリシー
          </a>
        </div>

        <Button variant="outline" onClick={handleSignOut} className="text-red-500 border-red-200">
          ログアウト
        </Button>
      </div>
    </MobileLayout>
  );
}
