export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatLongDate(input: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long"
  }).format(new Date(input));
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
}

export function getMonthBounds(base: Date) {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return { start, end };
}

export function addMonths(base: Date, amount: number) {
  return new Date(base.getFullYear(), base.getMonth() + amount, 1);
}

export function getDaysTogether(startedOn?: string | null) {
  if (!startedOn) return null;

  const start = new Date(startedOn);
  if (Number.isNaN(start.getTime())) return null;

  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

export function slugifyFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-+/g, "-").toLowerCase();
}

export function parseTagInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function monthKey(date: string) {
  return date.slice(0, 7);
}
