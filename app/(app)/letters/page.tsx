import { LetterComposer } from "@/components/letters/letter-composer";
import { EmptyState } from "@/components/ui/empty-state";
import { getLetters, getViewerContext } from "@/lib/data/queries";
import { formatLongDate } from "@/lib/utils";

export default async function LettersPage() {
  const viewer = await getViewerContext();
  const letters = await getLetters();

  if (!viewer?.relationship) {
    return (
      <EmptyState
        title="Create your diary first"
        body="Letters open once your private shared space is ready."
        ctaHref="/dashboard"
        ctaLabel="Go to dashboard"
      />
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      {viewer.partner ? (
        <LetterComposer
          recipientId={viewer.partner.id}
          recipientName={viewer.partner.display_name ?? viewer.partner.email}
        />
      ) : (
        <EmptyState
          title="Waiting for your partner"
          body="Once they join with your invite code, you can send letters back and forth."
        />
      )}

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Delivered notes</p>
          <h1 className="mt-3 font-display text-5xl text-foreground">Saved like pressed flowers.</h1>
        </div>
        {letters.length ? (
          letters.map((letter) => (
            <article key={letter.id} className="paper-panel p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/45">
                {formatLongDate(letter.created_at)}
              </p>
              <h2 className="mt-3 font-display text-3xl text-foreground">{letter.title}</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-foreground/70">{letter.body}</p>
            </article>
          ))
        ) : (
          <EmptyState title="No letters yet" body="The first one can be short. It just has to be yours." />
        )}
      </section>
    </div>
  );
}
