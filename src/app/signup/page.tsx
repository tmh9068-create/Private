"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(
      "登録しました。確認メールをご確認のうえ、ログインしてください。"
    );
    setTimeout(() => router.push("/login"), 2500);
  };

  return (
    <AuthLayout showHeader={false} showBack backHref="/login">
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">新規登録</h2>
        <p className="text-gray-500 text-sm mb-6">
          アカウントを作成して進捗を保存しましょう
        </p>

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

          <Input
            label="パスワード"
            type={showPassword ? "text" : "password"}
            placeholder="6文字以上"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
            minLength={6}
          />

          <Input
            label="パスワード（確認）"
            type={showConfirm ? "text" : "password"}
            placeholder="6文字以上"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={18} />}
            rightIcon={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
            minLength={6}
          />

          <p className="text-gray-500 text-xs mb-6 leading-relaxed">
            アカウントを作成することで、{" "}
            <a
              href="https://surpriselife.notion.site/1f466d0e7d50804786e1dfa104983317"
              target="_blank"
              rel="noopener noreferrer"
              className="text-majiai underline"
            >
              利用規約
            </a>{" "}
            および{" "}
            <a
              href="https://surpriselife.notion.site/1a366d0e7d50802fa9b5c9518474eff5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-majiai underline"
            >
              プライバシーポリシー
            </a>{" "}
            に同意したものとみなされます。
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {success && (
            <p className="text-green-600 text-sm mb-4 text-center">{success}</p>
          )}

          <Button type="submit" loading={loading}>
            アカウント作成
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-majiai font-bold">
            ログイン
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
