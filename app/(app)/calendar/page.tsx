import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { EmptyState } from "@/components/ui/empty-state";
import { getCalendarMemories, getViewerContext } from "@/lib/data/queries";
import { addMonths } from "@/lib/utils";

type CalendarPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const viewer = await getViewerContext();
  const currentMonth =
    typeof searchParams.month === "string" && /^\d{4}-\d{2}$/.test(searchParams.month)
      ? new Date(`${searchParams.month}-01`)
      : new Date();
  const entries = await getCalendarMemories(currentMonth);
  const prevMonth = addMonths(currentMonth, -1).toISOString().slice(0, 7);
  const nextMonth = addMonths(currentMonth, 1).toISOString().slice(0, 7);

  return viewer?.relationship ? (
    <MonthlyCalendar month={currentMonth} entries={entries} prevHref={`/calendar?month=${prevMonth}`} nextHref={`/calendar?month=${nextMonth}`} />
  ) : (
    <EmptyState
      title="Create your diary first"
      body="Calendar highlights appear once your couple space is created."
      ctaHref="/dashboard"
      ctaLabel="Go to dashboard"
    />
  );
}
