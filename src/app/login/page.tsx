"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    router.push("/home");
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h2>
        <p className="text-gray-500 text-sm mb-6">
          アカウントにログインして学習を始めましょう
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
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
            minLength={6}
          />

          <div className="text-right mb-6">
            <Link
              href="/forgot-password"
              className="text-gray-500 text-sm hover:text-majiai"
            >
              パスワードを忘れた方
            </Link>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <Button type="submit" loading={loading}>
            ログイン
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="text-majiai font-bold">
            新規登録
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
