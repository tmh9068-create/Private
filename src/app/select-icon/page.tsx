"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

const ICONS = [
  { id: "maji-kun", emoji: "😎", label: "マジくん" },
  { id: "master", emoji: "🧑‍🏫", label: "マスター" },
  { id: "usagi", emoji: "🐰", label: "うさぎ" },
  { id: "kitsune", emoji: "🦊", label: "きつね" },
  { id: "kuma", emoji: "🐻", label: "くま" },
  { id: "neko", emoji: "🐱", label: "ねこ" },
  { id: "panda", emoji: "🐼", label: "パンダ" },
  { id: "robot", emoji: "🤖", label: "ロボット" },
];

export default function SelectIconPage() {
  const { profile, updateProfile } = useAuth();
  const [selected, setSelected] = useState("maji-kun");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.avatar_icon) setSelected(profile.avatar_icon);
  }, [profile?.avatar_icon]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ avatar_icon: selected });
    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
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

        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">
          アイコンを選択
        </h1>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {ICONS.map((icon) => (
            <button
              key={icon.id}
              onClick={() => setSelected(icon.id)}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                selected === icon.id
                  ? "bg-majiai/10 border-2 border-majiai"
                  : "bg-white border border-gray-100"
              }`}
            >
              <span className="text-3xl">{icon.emoji}</span>
              <span className="text-[10px] text-gray-500">{icon.label}</span>
              {selected === icon.id && (
                <Check size={14} className="text-majiai absolute top-2 right-2" />
              )}
            </button>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saved ? "保存しました！" : saving ? "保存中..." : "保存する"}
        </Button>
      </div>
    </MobileLayout>
  );
}
