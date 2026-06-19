"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Trophy, User } from "lucide-react";
import { MobileLayout } from "./MobileLayout";

const tabs = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/friends", label: "フレンド", icon: Users },
  { href: "/ranking", label: "ランキング", icon: Trophy },
  { href: "/profile", label: "プロフィール", icon: User },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const hideTabBar =
    pathname.includes("/drill") ||
    pathname.includes("/lesson-complete") ||
    pathname.includes("/course-complete") ||
    pathname.includes("/series-complete") ||
    pathname.includes("/series-learning") ||
    pathname.includes("/series-test") ||
    pathname.includes("/add-friend") ||
    pathname.includes("/friend-detail") ||
    pathname.includes("/settings") ||
    pathname.includes("/select-icon");

  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col min-h-full">
        <main className={`flex-1 overflow-y-auto ${hideTabBar ? "" : "pb-20"}`}>
          {children}
        </main>

        {!hideTabBar && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white border-t border-gray-200 z-50">
            <div className="flex">
              {tabs.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex-1 flex flex-col items-center py-2 pt-3 ${
                      active ? "text-majiai" : "text-gray-400"
                    }`}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-[10px] mt-1 font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </MobileLayout>
  );
}
