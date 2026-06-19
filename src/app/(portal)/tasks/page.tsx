import Link from "next/link";
import { auth } from "@/lib/auth";
import { portalPages } from "@/lib/content/pages";
import { getUserProgressMap } from "@/lib/progress";

const monthlyTasks = [
  { month: 1, slug: "intro-diagram", title: "自己紹介の図解を作る" },
  { month: 2, slug: "personal-diagram-skill", title: "パーソナル図解スキルを作る" },
  { month: 3, slug: "personal-workspace-ui", title: "ひな形を自分の画面に仕上げる" },
  { month: 4, slug: "personal-workspace-data", title: "自分の画面に記憶を持たせる" },
];

const todoPages = portalPages
  .filter((page) => page.slug.startsWith("todo-"))
  .sort((a, b) => a.slug.localeCompare(b.slug));

export default async function TasksPage() {
  const session = await auth();
  const progress = session?.user?.id
    ? await getUserProgressMap(session.user.id)
    : {};

  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-ui-xl font-bold text-txt">課題</h1>
        <p className="mt-1 text-ui-base text-txt-sub">
          月次課題と講義後タスクの進捗です。
          {completedCount > 0 && (
            <span className="ml-2 text-primary">完了 {completedCount} 件</span>
          )}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-ui-lg font-bold text-txt">月次課題</h2>
        <div className="space-y-3">
          {monthlyTasks.map((task) => {
            const done = progress[task.slug];
            return (
              <Link
                key={task.slug}
                href={`/pages/${task.slug}`}
                className="block rounded-section border border-bd bg-surface p-5 shadow-hover transition hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-ui-xs font-bold uppercase tracking-wider text-primary">
                      第{task.month}ヶ月
                    </p>
                    <h3 className="mt-1 text-ui-lg font-bold text-txt">{task.title}</h3>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-ui-xs font-bold ${
                      done ? "bg-green-bg text-green-700" : "bg-page text-txt-dim"
                    }`}
                  >
                    {done ? "完了" : "未完了"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-ui-lg font-bold text-txt">講義後のやること</h2>
        <div className="space-y-2">
          {todoPages.map((page) => {
            const done = progress[page.slug];
            return (
              <Link
                key={page.slug}
                href={`/pages/${page.slug}`}
                className="flex items-center justify-between rounded-card border border-bd bg-surface px-4 py-3 text-ui-sm transition hover:border-primary/30"
              >
                <span className={done ? "text-txt-sub line-through" : "text-txt"}>
                  {page.title}
                </span>
                <span className={`text-ui-xs font-bold ${done ? "text-green-700" : "text-txt-dim"}`}>
                  {done ? "完了" : "未完了"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
