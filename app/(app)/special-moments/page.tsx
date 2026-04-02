import { MemoryCard } from "@/components/memory/memory-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getSpecialMoments } from "@/lib/data/queries";

export default async function SpecialMomentsPage() {
  const memories = await getSpecialMoments();

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 sm:p-8">
        <p className="eyebrow">Special moments</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-foreground">
          Anniversaries, birthdays, trips, and milestones.
        </h1>
      </section>

      {memories.length ? (
        <div className="space-y-4">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No special moments yet"
          body="Mark a memory as special and it will appear here in its own keepsake section."
          ctaHref="/memories/new"
          ctaLabel="Create memory"
        />
      )}
    </div>
  );
}
