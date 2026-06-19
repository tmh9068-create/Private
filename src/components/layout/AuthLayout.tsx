import Link from "next/link";
import { ReactNode } from "react";
import { MobileLayout } from "./MobileLayout";

interface AuthLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBack?: boolean;
  backHref?: string;
}

export function AuthLayout({
  children,
  showHeader = true,
  showBack = false,
  backHref = "/login",
}: AuthLayoutProps) {
  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col px-6 py-8">
        {showBack && (
          <Link
            href={backHref}
            className="text-gray-500 text-2xl mb-4 w-10 h-10 flex items-center"
          >
            ←
          </Link>
        )}

        {showHeader && (
          <div className="text-center mb-8 mt-4">
            <h1 className="text-[22px] font-extrabold text-majiai mb-2">
              本気AIドリル
            </h1>
            <p className="text-gray-500 text-sm">
              AIとプログラミングをゲーム感覚で学ぼう
            </p>
          </div>
        )}

        {children}
      </div>
    </MobileLayout>
  );
}
