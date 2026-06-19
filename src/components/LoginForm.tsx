"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";
import { Logo } from "@/components/Logo";

const CONTACT_URL =
  "https://tayori.com/form/59d283f664136f1bf4525b0a7eef7d3814bcdd72";

type LoginFormProps = {
  error?: string | null;
};

export function LoginForm({ error: initialError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayError =
    initialError === "AccessDenied"
      ? "access_denied"
      : initialError === "Verification"
        ? "verification"
        : error;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !trimmed.includes("@")) {
      setError("メールアドレスを正しく入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("resend", {
        email: trimmed,
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "AccessDenied") {
          setError("access_denied");
        } else {
          setError("エラーが発生しました。もう一度お試しください。");
        }
      } else {
        setSent(true);
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mb-1.5 text-ui-lg font-bold text-txt">メールを送信しました</h1>
        <p className="mb-1 text-ui-base text-txt-sub">
          以下のアドレスに認証リンクを送信しました。
        </p>
        <p className="mb-5 text-ui-base font-bold text-txt">{email}</p>
        <p className="text-ui-sm text-txt-dim">
          メールが届かない場合は迷惑メールフォルダもご確認ください。
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-3">
        <Logo />
        <span className="rounded bg-primary/10 px-2 py-0.5 text-ui-xs font-bold uppercase tracking-wider text-primary">
          受講生ポータル
        </span>
      </div>

      <h1 className="mb-1.5 text-center text-ui-lg font-bold text-txt">本人確認</h1>
      <p className="mb-4 text-center text-ui-sm leading-relaxed text-txt-sub">
        メールアドレス宛に認証リンクが届きます。
        <br />
        届いたリンクをクリックするとポータルにアクセスできます。
      </p>

      {displayError === "access_denied" && (
        <div className="mb-4 rounded-card border border-red/20 bg-red-bg px-4 py-3 text-ui-sm text-red">
          このメールアドレスは登録されていません。受講申込み時のアドレスをご入力ください。
          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block font-medium underline"
          >
            お問い合わせはこちら
          </a>
        </div>
      )}

      {displayError === "verification" && (
        <div className="mb-4 rounded-card border border-red/20 bg-red-bg px-4 py-3 text-ui-sm text-red">
          認証リンクが無効または期限切れです。もう一度お試しください。
        </div>
      )}

      {displayError &&
        displayError !== "access_denied" &&
        displayError !== "verification" && (
          <div className="mb-4 rounded-card border border-red/20 bg-red-bg px-4 py-3 text-ui-sm text-red">
            {displayError}
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-ui-sm font-medium text-txt">
            メールアドレス
            <span className="ml-1 font-normal text-txt-dim">
              （応募時に記載したアドレス）
            </span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            className="w-full rounded-card border border-bd bg-page px-3 py-2.5 text-ui-base text-txt outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoComplete="email"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-card bg-gradient-brand px-4 py-2.5 text-ui-base font-bold text-white transition hover:opacity-90 disabled:cursor-default disabled:opacity-60"
        >
          {loading ? "送信中..." : "認証リンクを送信"}
        </button>
      </form>

      {process.env.NODE_ENV === "development" && <DevLoginButtons />}
    </div>
  );
}

function DevLoginButtons() {
  const devUsers = [
    { email: "dev-fri@example.com", label: "開発太郎", tag: "金曜" },
    { email: "dev-sat@example.com", label: "開発花子", tag: "土曜" },
  ];

  return (
    <div className="mt-6 border-t border-bd pt-4">
      <p className="mb-2 text-ui-xs font-bold uppercase tracking-wider text-txt-dim">
        開発用ログイン
      </p>
      <div className="flex flex-wrap gap-2">
        {devUsers.map((user) => (
          <button
            key={user.email}
            type="button"
            onClick={() =>
              signIn("dev-login", { email: user.email, callbackUrl: "/" })
            }
            className="rounded border border-bd bg-page px-2.5 py-1.5 text-ui-xs text-txt-sub hover:bg-surface"
          >
            {user.label}
            <span className="ml-1 opacity-60">{user.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
