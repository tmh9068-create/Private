import Link from "next/link";
import { Check, CalendarPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import { dashboardQuickLinks, scheduleEvents } from "@/lib/navigation";
import { getProgressStats } from "@/lib/progress";

export default async function DashboardPage() {
  const session = await auth();
  const upcoming = scheduleEvents.filter((event) => !event.done).slice(0, 5);
  const completed = scheduleEvents.filter((event) => event.done).slice(-5);
  const stats = session?.user?.id
    ? await getProgressStats(session.user.id)
    : { completed: 0, total: 0 };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-ui-xl font-bold text-txt">ダッシュボード</h1>
        <p className="mt-1 text-ui-base text-txt-sub">
          {session?.user?.name}さん、おかえりなさい。
          {stats.completed > 0 && (
            <span className="ml-2 text-primary">
              ページ完了 {stats.completed} 件
            </span>
          )}
        </p>
      </header>

      <section className="rounded-section border border-bd bg-surface p-5 shadow-hover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-ui-lg font-bold text-txt">スケジュール</h2>
          <Link href="/schedule" className="text-ui-sm font-medium text-primary">
            すべて見る
          </Link>
        </div>
        <div className="space-y-2">
          {completed.map((event) => (
            <div
              key={event.label}
              className="flex items-center gap-3 rounded-card bg-page px-3 py-2 text-ui-sm text-txt-sub"
            >
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              <span className="line-through opacity-70">{event.label}</span>
            </div>
          ))}
          {upcoming.map((event) => (
            <div
              key={event.label}
              className="flex items-center gap-3 rounded-card border border-bd px-3 py-2 text-ui-sm text-txt"
            >
              <CalendarPlus className="h-4 w-4 shrink-0 text-primary" />
              <span>{event.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-section border border-bd bg-surface p-5 shadow-hover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-ui-lg font-bold text-txt">やるべきこと</h2>
          <Link href="/tasks" className="text-ui-sm font-medium text-primary">
            月次課題を見る
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {dashboardQuickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-card border border-bd bg-page px-4 py-3 text-ui-sm text-txt transition hover:border-primary/30 hover:shadow-hover"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
