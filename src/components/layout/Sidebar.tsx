"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { mainNavItems, supportNavItems } from "@/lib/navigation";
import type { Session } from "next-auth";

type SidebarProps = {
  user: Session["user"];
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const cohortLabel = user.cohortName
    ? `第${user.term ?? 1}期 ${user.cohortName}`
    : undefined;

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-card border border-bd bg-surface p-2 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
      >
        <Menu className="h-5 w-5 text-txt" />
      </button>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="メニューを閉じる"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col border-r border-bd bg-surface transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-bd px-5 py-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Logo className="h-7 w-auto" />
          </Link>
          <button
            type="button"
            className="rounded p-1 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="閉じる"
          >
            <X className="h-5 w-5 text-txt-sub" />
          </button>
        </div>

        <div className="border-b border-bd px-5 py-4">
          <p className="text-ui-base font-bold text-txt">{user.name}</p>
          <p className="truncate text-ui-sm text-txt-sub">{user.email}</p>
          {cohortLabel && (
            <span className="mt-2 inline-block rounded bg-primary/10 px-2 py-0.5 text-ui-xs font-bold text-primary">
              {cohortLabel}
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavSection items={mainNavItems} pathname={pathname} onNavigate={() => setOpen(false)} />
          <div className="my-4 border-t border-bd" />
          <NavSection
            items={supportNavItems}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </nav>

        <div className="border-t border-bd px-3 py-4">
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-card px-3 py-2 text-ui-sm ${
              pathname === "/settings"
                ? "bg-primary/10 font-medium text-primary"
                : "text-txt-sub hover:bg-page"
            }`}
            onClick={() => setOpen(false)}
          >
            設定
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-1 flex w-full items-center gap-3 rounded-card px-3 py-2 text-ui-sm text-txt-sub hover:bg-page"
          >
            <LogOut className="h-4 w-4" />
            ログアウト
          </button>
        </div>
      </aside>
    </>
  );
}

function NavSection({
  items,
  pathname,
  onNavigate,
}: {
  items: typeof mainNavItems;
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          item.children?.some((child) => pathname === child.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 rounded-card px-3 py-2 text-ui-sm ${
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-txt-sub hover:bg-page"
              }`}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
            {item.children && (
              <ul className="ml-7 mt-1 space-y-1">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className={`flex items-center gap-2 rounded-card px-3 py-1.5 text-ui-xs ${
                        pathname === child.href
                          ? "font-medium text-primary"
                          : "text-txt-dim hover:text-txt-sub"
                      }`}
                      onClick={onNavigate}
                    >
                      <ChevronRight className="h-3 w-3" />
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
