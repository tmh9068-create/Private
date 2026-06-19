"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <AuthLayout showHeader={false} showBack backHref="/login">
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          パスワードをリセット
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          登録したメールアドレスにリセット用のリンクを送信します
        </p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-700 text-sm">
              リセット用のメールを送信しました。メールボックスをご確認ください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="メールアドレス"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <Button type="submit" loading={loading}>
              リセットメールを送信
            </Button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          パスワードを思い出した方は{" "}
          <Link href="/login" className="text-majiai font-bold">
            ログイン
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
