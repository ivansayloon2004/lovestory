import Link from "next/link";

import { MemoryCard } from "@/components/memory/memory-card";
import { MemoryFilters } from "@/components/memory/memory-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getTimelineMemories, getViewerContext } from "@/lib/data/queries";

type MemoriesPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function MemoriesPage({ searchParams }: MemoriesPageProps) {
  const viewer = await getViewerContext();
  const memories = await getTimelineMemories({
    search: typeof searchParams.search === "string" ? searchParams.search : undefined,
    mood: typeof searchParams.mood === "string" ? searchParams.mood : undefined,
    tag: typeof searchParams.tag === "string" ? searchParams.tag : undefined,
    from: typeof searchParams.from === "string" ? searchParams.from : undefined,
    to: typeof searchParams.to === "string" ? searchParams.to : undefined
  });

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Timeline feed</p>
            <h1 className="mt-4 font-display text-6xl leading-none text-foreground">The story so far.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-foreground/70">
              Search by feeling, revisit a date, filter by tags, and keep every chapter easy to find.
            </p>
          </div>
          {viewer?.relationship ? (
            <Link href="/memories/new" className="soft-button">
              New memory
            </Link>
          ) : null}
        </div>
      </section>

      <MemoryFilters filters={searchParams} />

      {viewer?.relationship ? (
        memories.length ? (
          <div className="space-y-4">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No memories match those filters"
            body="Try a different mood, tag, or date range, or create the next memory yourself."
            ctaHref="/memories/new"
            ctaLabel="Create memory"
          />
        )
      ) : (
        <EmptyState
          title="Create or join a diary first"
          body="Timeline pages open as soon as your private two-person space exists."
          ctaHref="/dashboard"
          ctaLabel="Go to dashboard"
        />
      )}
    </div>
  );
}
