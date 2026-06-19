import { scheduleEvents } from "@/lib/navigation";
import { Check, CalendarPlus } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-ui-xl font-bold text-txt">スケジュール</h1>
        <p className="mt-1 text-ui-base text-txt-sub">
          講義・グループセッション・提出期限の一覧です。
        </p>
      </header>

      <div className="rounded-section border border-bd bg-surface p-5 shadow-hover">
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
      </div>
    </div>
  );
}
