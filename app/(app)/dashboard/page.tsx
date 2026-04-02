import Link from "next/link";

import { InstallPrompt } from "@/components/pwa/install-prompt";
import { RelationshipPanel } from "@/components/relationship/relationship-panel";
import { MemoryCard } from "@/components/memory/memory-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardSnapshot, getViewerContext } from "@/lib/data/queries";
import { formatLongDate } from "@/lib/utils";

export default async function DashboardPage() {
  const viewer = await getViewerContext();
  const snapshot = await getDashboardSnapshot();

  if (!viewer) return null;

  return (
    <div className="space-y-8">
      <section className="glass-panel overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow">Shared dashboard</p>
            <h1 className="mt-5 font-display text-6xl leading-[0.92] text-foreground">
              {viewer.partner
                ? `A home for ${viewer.profile.display_name ?? viewer.email} and ${viewer.partner.display_name ?? viewer.partner.email}.`
                : "Start the diary, then invite your person in."}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-foreground/70">
              Track anniversaries, write memories together, send letters, and keep your private timeline
              beautifully organized across mobile and desktop.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/memories/new" className="soft-button">
                Add a memory
              </Link>
              <InstallPrompt />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: "Days together",
                value: snapshot?.daysTogether ? `${snapshot.daysTogether}` : "Set anniversary",
                hint: viewer.relationship?.started_on
                  ? `Since ${formatLongDate(viewer.relationship.started_on)}`
                  : "Add your anniversary when you create the diary."
              },
              {
                label: "Shared memories",
                value: `${snapshot?.totalMemories ?? 0}`,
                hint: "Cards, calendar highlights, and gallery photos stay in sync."
              },
              {
                label: "Special moments",
                value: `${snapshot?.specialMoments ?? 0}`,
                hint: "Trips, anniversaries, birthdays, and important events."
              }
            ].map((stat) => (
              <div key={stat.label} className="paper-panel p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-foreground/45">{stat.label}</p>
                <p className="mt-4 font-display text-5xl text-foreground">{stat.value}</p>
                <p className="mt-2 text-sm leading-7 text-foreground/65">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RelationshipPanel viewer={viewer} />

      {viewer.relationship ? (
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Recent memories</p>
                <h2 className="mt-3 font-display text-4xl text-foreground">Your latest pages.</h2>
              </div>
              <Link href="/memories" className="soft-button-secondary">
                View timeline
              </Link>
            </div>

            {snapshot?.recentMemories.length ? (
              <div className="space-y-4">
                {snapshot.recentMemories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No memories yet"
                body="Create the first page in your diary and let the timeline begin."
                ctaHref="/memories/new"
                ctaLabel="Create first memory"
              />
            )}
          </section>

          <section className="space-y-4">
            <div>
              <p className="eyebrow">Letters</p>
              <h2 className="mt-3 font-display text-4xl text-foreground">Soft things worth saving.</h2>
            </div>
            <div className="space-y-4">
              {snapshot?.recentLetters.length ? (
                snapshot.recentLetters.map((letter) => (
                  <article key={letter.id} className="paper-panel p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-foreground/45">
                      {formatLongDate(letter.created_at)}
                    </p>
                    <h3 className="mt-3 font-display text-3xl text-foreground">{letter.title}</h3>
                    <p className="mt-4 line-clamp-5 text-sm leading-7 text-foreground/70">{letter.body}</p>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No letters yet"
                  body="Your note wall is ready whenever you want to leave something tender behind."
                  ctaHref="/letters"
                  ctaLabel="Write a letter"
                />
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
