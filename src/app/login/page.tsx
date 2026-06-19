import { LoginForm } from "@/components/LoginForm";

type LoginPageProps = {
  searchParams: { error?: string; callbackUrl?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-page px-5">
      <div className="w-full max-w-[420px]">
        <div className="rounded-hero border border-bd bg-surface px-8 py-8 shadow-hover max-sm:px-5 max-sm:py-6">
          <LoginForm error={searchParams.error ?? null} />
        </div>
        <p className="mt-4 text-center text-ui-sm text-txt-dim">
          © 2026 AI-Driven School / 株式会社Surprise
        </p>
      </div>
    </div>
  );
}
