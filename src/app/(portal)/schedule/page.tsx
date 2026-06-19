import { scheduleEvents } from "@/lib/navigation";
import { Check, CalendarPlus, ExternalLink } from "lucide-react";

const calendarEmbedUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL;

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-ui-xl font-bold text-txt">スケジュール</h1>
        <p className="mt-1 text-ui-base text-txt-sub">
          講義・グループセッション・提出期限の一覧です。
        </p>
      </header>

      {calendarEmbedUrl && (
        <section className="overflow-hidden rounded-section border border-bd bg-surface shadow-hover">
          <div className="flex items-center justify-between border-b border-bd px-5 py-3">
            <h2 className="text-ui-lg font-bold text-txt">Googleカレンダー</h2>
            <a
              href={calendarEmbedUrl.replace("/embed?", "/render?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ui-sm text-primary"
            >
              新しいタブで開く
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <iframe
            src={calendarEmbedUrl}
            className="h-[480px] w-full border-0"
            title="AI-Driven School スケジュール"
          />
        </section>
      )}

      <section className="rounded-section border border-bd bg-surface p-5 shadow-hover">
        <h2 className="mb-4 text-ui-lg font-bold text-txt">イベント一覧</h2>
        <ul className="space-y-2">
          {scheduleEvents.map((event) => (
            <li
              key={`${event.date}-${event.label}`}
              className="flex items-center gap-3 rounded-card border border-bd px-4 py-3 text-ui-sm"
            >
              {event.done ? (
                <Check className="h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <CalendarPlus className="h-4 w-4 shrink-0 text-primary" />
              )}
              <div>
                <p className={event.done ? "text-txt-sub line-through" : "font-medium text-txt"}>
                  {event.label}
                </p>
                <p className="text-ui-xs text-txt-dim">{event.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
