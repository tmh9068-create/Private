import Link from "next/link";

const monthlyTasks = [
  {
    month: 1,
    title: "自己紹介の図解を作る",
    href: "/pages/intro-diagram",
    status: "done" as const,
  },
  {
    month: 2,
    title: "面倒な報告を自動化するツールを作る",
    href: "/pages/personal-diagram-skill",
    status: "done" as const,
  },
  {
    month: 3,
    title: "ひな形を自分の画面に仕上げる",
    href: "/pages/personal-workspace-ui",
    status: "current" as const,
  },
  {
    month: 4,
    title: "自分の画面に記憶を持たせる",
    href: "/pages/personal-workspace-data",
    status: "upcoming" as const,
  },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-ui-xl font-bold text-txt">課題</h1>
        <p className="mt-1 text-ui-base text-txt-sub">月次課題の一覧と進捗です。</p>
      </header>

      <div className="space-y-3">
        {monthlyTasks.map((task) => (
          <Link
            key={task.month}
            href={task.href}
            className="block rounded-section border border-bd bg-surface p-5 shadow-hover transition hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-ui-xs font-bold uppercase tracking-wider text-primary">
                  第{task.month}ヶ月
                </p>
                <h2 className="mt-1 text-ui-lg font-bold text-txt">{task.title}</h2>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-ui-xs font-bold ${
                  task.status === "done"
                    ? "bg-green-bg text-green-700"
                    : task.status === "current"
                      ? "bg-primary/10 text-primary"
                      : "bg-page text-txt-dim"
                }`}
              >
                {task.status === "done"
                  ? "完了"
                  : task.status === "current"
                    ? "進行中"
                    : "未着手"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
