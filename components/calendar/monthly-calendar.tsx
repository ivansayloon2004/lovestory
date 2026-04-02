import Link from "next/link";

import { cn, formatLongDate, formatMonthLabel } from "@/lib/utils";

type CalendarEntry = {
  id: string;
  title: string;
  memory_date: string;
  mood: string;
  is_special_moment: boolean;
};

type MonthlyCalendarProps = {
  month: Date;
  entries: CalendarEntry[];
  prevHref: string;
  nextHref: string;
};

export function MonthlyCalendar({ month, entries, prevHref, nextHref }: MonthlyCalendarProps) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: startOffset + totalDays }, (_, index) => {
    if (index < startOffset) return null;
    return new Date(month.getFullYear(), month.getMonth(), index - startOffset + 1);
  });

  const entryMap = entries.reduce<Record<string, CalendarEntry[]>>((acc, entry) => {
    acc[entry.memory_date] = [...(acc[entry.memory_date] ?? []), entry];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="paper-panel flex items-center justify-between p-5">
        <Link href={prevHref} className="soft-button-secondary">
          ←
        </Link>
        <div className="text-center">
          <p className="eyebrow">Calendar view</p>
          <h2 className="mt-3 font-display text-4xl text-foreground">{formatMonthLabel(month)}</h2>
        </div>
        <Link href={nextHref} className="soft-button-secondary">
          →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.24em] text-foreground/45">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-3">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="hidden xl:block" />;
          }

          const key = date.toISOString().slice(0, 10);
          const dayEntries = entryMap[key] ?? [];

          return (
            <div
              key={key}
              className={cn(
                "paper-panel min-h-[170px] p-4",
                dayEntries.length && "border-accent/35 bg-white/90 dark:bg-white/10"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-foreground/45">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{date.getDate()}</p>
                </div>
                {dayEntries.length ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accentSoft text-sm">
                    {dayEntries.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                {dayEntries.slice(0, 3).map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/memories/${entry.id}`}
                    className="block rounded-[1rem] bg-muted px-3 py-2 text-sm text-foreground/75 transition hover:bg-accentSoft"
                    title={formatLongDate(entry.memory_date)}
                  >
                    <span className="font-medium">{entry.title}</span>
                    {entry.is_special_moment ? <span className="ml-2 text-xs text-heart">special</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
