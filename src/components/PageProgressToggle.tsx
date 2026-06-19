"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

type PageProgressToggleProps = {
  pageSlug: string;
  initialCompleted?: boolean;
};

export function PageProgressToggle({
  pageSlug,
  initialCompleted = false,
}: PageProgressToggleProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    startTransition(async () => {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSlug, completed: next }),
      });
      if (response.ok) {
        setCompleted(next);
      }
    });
  }

  return (
    <div className="mt-10 rounded-section border border-bd bg-page p-4">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`flex w-full items-center gap-3 rounded-card px-4 py-3 text-left text-ui-sm transition ${
          completed
            ? "bg-green-bg text-green-700"
            : "bg-surface text-txt hover:border-primary/30"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded border ${
            completed ? "border-green-600 bg-green-600 text-white" : "border-bd"
          }`}
        >
          {completed && <Check className="h-3.5 w-3.5" />}
        </span>
        {completed ? "完了済み（クリックで未完了に戻す）" : "このページを完了にする"}
      </button>
    </div>
  );
}
